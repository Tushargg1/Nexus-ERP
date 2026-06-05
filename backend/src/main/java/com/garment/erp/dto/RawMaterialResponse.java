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
public class RawMaterialResponse {
    private Long id;
    private String name;
    private String category;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal purchasePrice;
    private Long supplierId;
    private String supplierName;
    private Integer reorderLevel;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
