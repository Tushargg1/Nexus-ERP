package com.garment.erp.controller;

import com.garment.erp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(null);
    }
    @GetMapping("/chart")
    public ResponseEntity<?> chart(@RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(service.getChartData(period));
    }
}
