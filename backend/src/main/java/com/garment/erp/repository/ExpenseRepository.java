package com.garment.erp.repository;

import com.garment.erp.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate = :date")
    BigDecimal sumAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year")
    BigDecimal sumAmountByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year GROUP BY e.category")
    List<Object[]> findCategorySummaryByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT MONTH(e.expenseDate), YEAR(e.expenseDate), COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate >= :startDate GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) ORDER BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
    List<Object[]> findMonthlyTotals(@Param("startDate") LocalDate startDate);
}
