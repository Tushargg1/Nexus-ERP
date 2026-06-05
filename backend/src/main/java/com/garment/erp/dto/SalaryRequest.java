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
public class SalaryRequest {
    private Long employeeId;
    private Integer month;
    private Integer year;
    private BigDecimal basicSalary;
    private BigDecimal advancePaid;
    private BigDecimal overtimeAmount;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private boolean isPaid;
    private LocalDate paymentDate;
    private String notes;
}
