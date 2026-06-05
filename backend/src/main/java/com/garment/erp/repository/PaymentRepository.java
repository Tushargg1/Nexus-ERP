package com.garment.erp.repository;

import com.garment.erp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByTypeAndReferenceId(Payment.PaymentType type, Long referenceId);

    List<Payment> findByType(Payment.PaymentType type);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.type = :type AND p.referenceId = :referenceId")
    BigDecimal sumAmountByTypeAndReferenceId(@Param("type") Payment.PaymentType type,
                                              @Param("referenceId") Long referenceId);
}
