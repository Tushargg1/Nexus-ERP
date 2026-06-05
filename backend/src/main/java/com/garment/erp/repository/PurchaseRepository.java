package com.garment.erp.repository;

import com.garment.erp.entity.PaymentStatus;
import com.garment.erp.entity.Purchase;
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
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findBySupplierId(Long supplierId);

    List<Purchase> findByStatus(PaymentStatus status);

    List<Purchase> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    Page<Purchase> findBySupplierId(Long supplierId, Pageable pageable);

    Page<Purchase> findByStatus(PaymentStatus status, Pageable pageable);

    Page<Purchase> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Optional<Purchase> findTopByOrderByIdDesc();

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.purchaseDate = :date")
    BigDecimal sumTotalAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE MONTH(p.purchaseDate) = :month AND YEAR(p.purchaseDate) = :year")
    BigDecimal sumTotalAmountByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(p.pendingAmount), 0) FROM Purchase p WHERE p.status IN ('PENDING', 'PARTIAL')")
    BigDecimal sumTotalPending();

    @Query("SELECT p FROM Purchase p WHERE p.status IN ('PENDING','PARTIAL') AND p.purchaseDate < :dueDate")
    List<Purchase> findOverduePurchases(@Param("dueDate") LocalDate dueDate);
}
