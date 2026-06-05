package com.garment.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal rate;
    private BigDecimal gstPercent;
    private BigDecimal amount;
}
