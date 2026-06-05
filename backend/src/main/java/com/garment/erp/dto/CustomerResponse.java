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
public class CustomerResponse {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String gstNumber;
    private String businessName;
    private String email;
    private BigDecimal creditLimit;
    private BigDecimal outstanding;
    private BigDecimal totalSales;
    private BigDecimal totalReceived;
    private boolean active;
    private LocalDateTime createdAt;
}
