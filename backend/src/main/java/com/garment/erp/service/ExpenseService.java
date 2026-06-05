package com.garment.erp.service;

import com.garment.erp.dto.ExpenseRequest;
import com.garment.erp.dto.ExpenseResponse;
import com.garment.erp.entity.Expense;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Page<ExpenseResponse> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable).map(this::toResponse);
    }

    public ExpenseResponse getExpenseById(Long id) {
        return toResponse(expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id)));
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .description(request.getDescription())
                .paymentMode(request.getPaymentMode())
                .receiptNo(request.getReceiptNo())
                .build();
        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setDescription(request.getDescription());
        expense.setPaymentMode(request.getPaymentMode());
        expense.setReceiptNo(request.getReceiptNo());
        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense", "id", id);
        }
        expenseRepository.deleteById(id);
    }

    public Map<String, BigDecimal> getExpenseSummaryByCategory(int month, int year) {
        List<Object[]> results = expenseRepository.findCategorySummaryByMonthAndYear(month, year);
        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        for (Object[] row : results) {
            summary.put((String) row[0], (BigDecimal) row[1]);
        }
        return summary;
    }

    public List<Map<String, Object>> getMonthlyExpenses() {
        LocalDate startDate = LocalDate.now().minusMonths(12);
        List<Object[]> results = expenseRepository.findMonthlyTotals(startDate);
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", row[0]);
            m.put("year", row[1]);
            m.put("total", row[2]);
            monthly.add(m);
        }
        return monthly;
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .paymentMode(expense.getPaymentMode())
                .receiptNo(expense.getReceiptNo())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
