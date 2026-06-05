package com.garment.erp.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReportRequest {
    private String reportType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
}
