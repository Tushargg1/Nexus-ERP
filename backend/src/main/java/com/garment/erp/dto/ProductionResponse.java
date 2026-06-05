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
public class ProductionResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String stage;
    private LocalDate startDate;
    private LocalDate completionDate;
    private Integer plannedQuantity;
    private Integer completedQuantity;
    private String notes;
    private List<ProductionItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductionItemResponse {
        private Long id;
        private Long rawMaterialId;
        private String rawMaterialName;
        private BigDecimal quantityUsed;
    }
}
