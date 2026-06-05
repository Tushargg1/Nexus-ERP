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
public class FinishedProductRequest {
    private String name;
    private String size;
    private String color;
    private BigDecimal quantity;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private Integer reorderLevel;
    private String sku;
}
