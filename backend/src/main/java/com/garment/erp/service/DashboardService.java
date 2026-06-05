package com.garment.erp.service;

import com.garment.erp.dto.ChartData;
import com.garment.erp.dto.DashboardStats;
import com.garment.erp.entity.Production;
import com.garment.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final FinishedProductRepository finishedProductRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductionRepository productionRepository;
    private final NotificationRepository notificationRepository;

    public DashboardStats getStats() {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        BigDecimal todaySales = saleRepository.sumTotalAmountByDate(today);
        BigDecimal todayPurchases = purchaseRepository.sumTotalAmountByDate(today);
        BigDecimal todayExpenses = expenseRepository.sumAmountByDate(today);

        BigDecimal monthSales = saleRepository.sumTotalAmountByMonthAndYear(month, year);
        BigDecimal monthPurchases = purchaseRepository.sumTotalAmountByMonthAndYear(month, year);
        BigDecimal monthExpenses = expenseRepository.sumAmountByMonthAndYear(month, year);

        BigDecimal totalPayables = purchaseRepository.sumTotalPending();
        BigDecimal totalReceivables = saleRepository.sumTotalPending();

        long lowStockRaw = rawMaterialRepository.findLowStock().size();
        long lowStockFinished = finishedProductRepository.findLowStock().size();
        long lowStockCount = lowStockRaw + lowStockFinished;

        long activeProductions = productionRepository.findByStageNot(Production.ProductionStage.COMPLETED).size();

        return DashboardStats.builder()
                .todaySales(todaySales)
                .todayPurchases(todayPurchases)
                .todayExpenses(todayExpenses)
                .monthSales(monthSales)
                .monthPurchases(monthPurchases)
                .monthExpenses(monthExpenses)
                .totalPendingPayables(totalPayables)
                .totalPendingReceivables(totalReceivables)
                .lowStockCount(lowStockCount)
                .totalSuppliers(supplierRepository.findByActiveTrue().size())
                .totalCustomers(customerRepository.findByActiveTrue().size())
                .totalEmployees(employeeRepository.findByActiveTrue().size())
                .totalProducts(finishedProductRepository.count())
                .activeProductions(activeProductions)
                .build();
    }

    public ChartData getChartData(String period) {
        List<String> labels = new ArrayList<>();
        List<BigDecimal> salesData = new ArrayList<>();
        List<BigDecimal> purchaseData = new ArrayList<>();
        List<BigDecimal> profitData = new ArrayList<>();
        List<BigDecimal> expenseData = new ArrayList<>();

        if ("WEEKLY".equals(period)) {
            // Last 7 days
            for (int i = 6; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                labels.add(date.toString());
                BigDecimal sales = saleRepository.sumTotalAmountByDate(date);
                if (sales == null) sales = BigDecimal.ZERO;
                BigDecimal purchases = purchaseRepository.sumTotalAmountByDate(date);
                if (purchases == null) purchases = BigDecimal.ZERO;
                BigDecimal expenses = expenseRepository.sumAmountByDate(date);
                if (expenses == null) expenses = BigDecimal.ZERO;
                salesData.add(sales);
                purchaseData.add(purchases);
                profitData.add(sales.subtract(purchases).subtract(expenses));
                expenseData.add(expenses);
            }
        } else {
            // Last 12 months
            for (int i = 11; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusMonths(i);
                int m = date.getMonthValue();
                int y = date.getYear();
                labels.add(date.getMonth().name().substring(0, 3) + " " + y);
                BigDecimal sales = saleRepository.sumTotalAmountByMonthAndYear(m, y);
                if (sales == null) sales = BigDecimal.ZERO;
                BigDecimal purchases = purchaseRepository.sumTotalAmountByMonthAndYear(m, y);
                if (purchases == null) purchases = BigDecimal.ZERO;
                BigDecimal expenses = expenseRepository.sumAmountByMonthAndYear(m, y);
                if (expenses == null) expenses = BigDecimal.ZERO;
                salesData.add(sales);
                purchaseData.add(purchases);
                profitData.add(sales.subtract(purchases).subtract(expenses));
                expenseData.add(expenses);
            }
        }

        return ChartData.builder()
                .labels(labels)
                .salesData(salesData)
                .purchaseData(purchaseData)
                .profitData(profitData)
                .expenseData(expenseData)
                .build();
    }

    public Map<String, Object> getAlerts() {
        Map<String, Object> alerts = new HashMap<>();
        alerts.put("lowStockRawMaterials", rawMaterialRepository.findLowStock().stream()
                .map(m -> Map.of("id", m.getId(), "name", m.getName(), "quantity", m.getQuantity(), "reorderLevel", m.getReorderLevel()))
                .collect(Collectors.toList()));
        alerts.put("lowStockProducts", finishedProductRepository.findLowStock().stream()
                .map(p -> Map.of("id", p.getId(), "name", p.getName(), "quantity", p.getQuantity(), "reorderLevel", p.getReorderLevel()))
                .collect(Collectors.toList()));
        alerts.put("unreadNotifications", notificationRepository.countByIsReadFalse());
        return alerts;
    }
}
