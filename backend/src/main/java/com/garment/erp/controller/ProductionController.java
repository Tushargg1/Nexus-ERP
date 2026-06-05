package com.garment.erp.controller;

import com.garment.erp.dto.ProductionRequest;
import com.garment.erp.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService service;

    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAllProductions(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getProductionById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductionRequest request) {
        return ResponseEntity.ok(service.createProduction(request));
    }

    @PutMapping("/{id}/advance")
    public ResponseEntity<?> advanceStage(@PathVariable Long id) {
        return ResponseEntity.ok(service.advanceStage(id));
    }
}
