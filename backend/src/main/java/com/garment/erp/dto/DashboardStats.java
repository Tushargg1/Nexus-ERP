package com.garment.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private BigDecimal todaySales;
    private BigDecimal todayPurchases;
    private BigDecimal todayExpenses;
    private BigDecimal monthSales;
    private BigDecimal monthPurchases;
    private BigDecimal monthExpenses;
    private BigDecimal totalPendingPayables;
    private BigDecimal totalPendingReceivables;
    private Long lowStockCount;
    private Integer totalSuppliers;
    private Integer totalCustomers;
    private Integer totalEmployees;
    private Long totalProducts;
    private Long activeProductions;
}
