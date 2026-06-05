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
public class EmployeeRequest {
    private String name;
    private String designation;
    private String phone;
    private String address;
    private BigDecimal baseSalary;
    private LocalDate joiningDate;
    private String bankAccount;
    private String bankName;
    private String ifscCode;
    private boolean active;
}
