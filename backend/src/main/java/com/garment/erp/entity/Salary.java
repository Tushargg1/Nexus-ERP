package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "salaries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "salary_month", "salary_year"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "salary_month", nullable = false)
    private Integer month;

    @Column(name = "salary_year", nullable = false)
    private Integer year;

    @Column(name = "basic_salary", precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "advance_paid", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal advancePaid = BigDecimal.ZERO;

    @Column(name = "overtime_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal overtimeAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_salary", precision = 10, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "is_paid")
    @Builder.Default
    private boolean isPaid = false;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

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
}
