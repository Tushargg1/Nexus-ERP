package com.garment.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private Long id;
    private String name;
    private String mobile;
    private String address;
    private String gstNumber;
    private String materialSupplied;
    private String email;
    private String bankAccount;
    private String bankName;
    private String ifscCode;
    private boolean active;
    private LocalDateTime createdAt;
    private BigDecimal totalPurchases;
    private BigDecimal totalPaid;
    private BigDecimal outstanding;
}
