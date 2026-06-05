package com.garment.erp.controller;

import com.garment.erp.dto.SupplierRequest;
import com.garment.erp.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService service;

    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAllSuppliers(null, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getSupplierById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SupplierRequest request) {
        return ResponseEntity.ok(service.createSupplier(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(service.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteSupplier(id);
        return ResponseEntity.ok().build();
    }
}
