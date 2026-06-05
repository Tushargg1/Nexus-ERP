package com.garment.erp.repository;

import com.garment.erp.entity.PaymentStatus;
import com.garment.erp.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCustomerId(Long customerId);

    List<Sale> findBySaleDateBetween(LocalDate startDate, LocalDate endDate);

    List<Sale> findByStatus(PaymentStatus status);

    Page<Sale> findByCustomerId(Long customerId, Pageable pageable);

    Page<Sale> findByStatus(PaymentStatus status, Pageable pageable);

    Page<Sale> findBySaleDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Optional<Sale> findTopByOrderByIdDesc();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate = :date")
    BigDecimal sumTotalAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE MONTH(s.saleDate) = :month AND YEAR(s.saleDate) = :year")
    BigDecimal sumTotalAmountByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(s.pendingAmount), 0) FROM Sale s WHERE s.status IN ('PENDING', 'PARTIAL')")
    BigDecimal sumTotalPending();

    @Query("SELECT s FROM Sale s WHERE s.status IN ('PENDING','PARTIAL') AND s.saleDate < :dueDate")
    List<Sale> findOverdueSales(@Param("dueDate") LocalDate dueDate);

    @Query("SELECT s.saleDate, COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate BETWEEN :start AND :end GROUP BY s.saleDate ORDER BY s.saleDate")
    List<Object[]> findDailySalesSummary(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
