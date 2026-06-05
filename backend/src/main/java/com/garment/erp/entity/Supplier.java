package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 15)
    private String mobile;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "gst_number", length = 20)
    private String gstNumber;

    @Column(name = "material_supplied")
    private String materialSupplied;

    @Column(length = 100)
    private String email;

    @Column(name = "bank_account", length = 20)
    private String bankAccount;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode;

    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
