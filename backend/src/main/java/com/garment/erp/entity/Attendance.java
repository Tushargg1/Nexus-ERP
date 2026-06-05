package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "date"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "overtime_hours", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(length = 255)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    public enum AttendanceStatus {
        PRESENT, ABSENT, HALF_DAY, LEAVE
    }

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        try {
            if (com.garment.erp.security.SecurityUtils.isOwner()) {
                this.approvalStatus = ApprovalStatus.APPROVED;
            } else {
                this.approvalStatus = ApprovalStatus.PENDING;
            }
        } catch(Exception e) {}
    }
}
