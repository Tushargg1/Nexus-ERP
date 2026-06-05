package com.garment.erp.controller;

import com.garment.erp.dto.RawMaterialRequest;
import com.garment.erp.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rawmaterial")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService service;

    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable, @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.getAllMaterials(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getMaterialById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RawMaterialRequest request) {
        return ResponseEntity.ok(service.createMaterial(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RawMaterialRequest request) {
        return ResponseEntity.ok(service.updateMaterial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}
