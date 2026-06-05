package com.garment.erp.controller;

import com.garment.erp.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/salary")
@RequiredArgsConstructor
public class SalaryController {
    private final SalaryService service;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok("Not fully implemented");
    }
}
