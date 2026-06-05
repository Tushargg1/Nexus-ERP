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
public class PaymentResponse {
    private Long id;
    private String type;
    private Long referenceId;
    private BigDecimal amount;
    private String paymentMode;
    private LocalDate paymentDate;
    private String transactionRef;
    private String notes;
    private LocalDateTime createdAt;
}
