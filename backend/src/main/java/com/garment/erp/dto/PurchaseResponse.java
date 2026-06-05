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
public class PurchaseResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private String invoiceNo;
    private LocalDate purchaseDate;
    private BigDecimal subtotal;
    private BigDecimal gstAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal pendingAmount;
    private String status;
    private String notes;
    private List<PurchaseItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseItemResponse {
        private Long id;
        private Long rawMaterialId;
        private String rawMaterialName;
        private BigDecimal quantity;
        private BigDecimal rate;
        private BigDecimal amount;
    }
}
