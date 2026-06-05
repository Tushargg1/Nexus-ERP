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
public class ProductionRequest {
    private Long productId;
    private String stage;
    private LocalDate startDate;
    private LocalDate completionDate;
    private Integer plannedQuantity;
    private Integer completedQuantity;
    private String notes;
    private List<ProductionItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductionItemRequest {
        private Long rawMaterialId;
        private BigDecimal quantityUsed;
    }
}
