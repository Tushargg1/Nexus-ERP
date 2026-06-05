package com.garment.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartData {
    private List<String> labels;
    private List<BigDecimal> salesData;
    private List<BigDecimal> purchaseData;
    private List<BigDecimal> profitData;
    private List<BigDecimal> expenseData;
}
