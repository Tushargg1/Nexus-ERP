package com.garment.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportsController {
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok("Not fully implemented");
    }
}
