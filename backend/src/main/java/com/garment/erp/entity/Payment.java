package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode", length = 20)
    @Builder.Default
    private String paymentMode = "CASH";

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        try {
            if (com.garment.erp.security.SecurityUtils.isOwner()) {
                this.approvalStatus = ApprovalStatus.APPROVED;
            } else {
                this.approvalStatus = ApprovalStatus.PENDING;
            }
        } catch(Exception e) {}
    }

    public enum PaymentType {
        SUPPLIER, CUSTOMER
    }
}
