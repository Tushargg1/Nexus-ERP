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
public class SaleRequest {
    private Long customerId;
    private String customerName;
    private String invoiceNo;
    private LocalDate saleDate;
    private BigDecimal paidAmount;
    private String gstType;
    private String notes;
    private List<SaleItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemRequest {
        private Long productId;
        private BigDecimal quantity;
        private BigDecimal rate;
        private BigDecimal gstPercent;
    }
}
