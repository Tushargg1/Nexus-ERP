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
public class RawMaterialRequest {
    private String name;
    private String category;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal purchasePrice;
    private Long supplierId;
    private Integer reorderLevel;
}
