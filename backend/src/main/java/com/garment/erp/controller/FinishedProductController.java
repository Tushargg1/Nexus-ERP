package com.garment.erp.controller;

import com.garment.erp.dto.FinishedProductRequest;
import com.garment.erp.service.FinishedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/finishedproduct")
@RequiredArgsConstructor
public class FinishedProductController {

    private final FinishedProductService service;

    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable, @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.getAllProducts(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FinishedProductRequest request) {
        return ResponseEntity.ok(service.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FinishedProductRequest request) {
        return ResponseEntity.ok(service.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
