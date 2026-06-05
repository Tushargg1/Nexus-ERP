package com.garment.erp.service;

import com.garment.erp.dto.RawMaterialRequest;
import com.garment.erp.dto.RawMaterialResponse;
import com.garment.erp.entity.RawMaterial;
import com.garment.erp.entity.Supplier;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.RawMaterialRepository;
import com.garment.erp.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final SupplierRepository supplierRepository;

    public Page<RawMaterialResponse> getAllMaterials(String search, Pageable pageable) {
        Page<RawMaterial> materials;
        if (search != null && !search.isEmpty()) {
            materials = rawMaterialRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            materials = rawMaterialRepository.findAll(pageable);
        }
        return materials.map(this::toResponse);
    }

    public RawMaterialResponse getMaterialById(Long id) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));
        return toResponse(material);
    }

    public RawMaterialResponse createMaterial(RawMaterialRequest request) {
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        }

        RawMaterial material = RawMaterial.builder()
                .name(request.getName())
                .category(request.getCategory())
                .quantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO)
                .unit(request.getUnit())
                .purchasePrice(request.getPurchasePrice())
                .supplier(supplier)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .build();

        return toResponse(rawMaterialRepository.save(material));
    }

    public RawMaterialResponse updateMaterial(Long id, RawMaterialRequest request) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        }

        material.setName(request.getName());
        material.setCategory(request.getCategory());
        material.setQuantity(request.getQuantity() != null ? request.getQuantity() : material.getQuantity());
        material.setUnit(request.getUnit());
        material.setPurchasePrice(request.getPurchasePrice());
        material.setSupplier(supplier);
        material.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : material.getReorderLevel());

        return toResponse(rawMaterialRepository.save(material));
    }

    public void deleteMaterial(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("RawMaterial", "id", id);
        }
        rawMaterialRepository.deleteById(id);
    }

    public List<RawMaterialResponse> getLowStockMaterials() {
        return rawMaterialRepository.findLowStock().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RawMaterialResponse adjustQuantity(Long id, BigDecimal adjustment) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));
        material.setQuantity(adjustment);
        return toResponse(rawMaterialRepository.save(material));
    }

    private RawMaterialResponse toResponse(RawMaterial material) {
        return RawMaterialResponse.builder()
                .id(material.getId())
                .name(material.getName())
                .category(material.getCategory())
                .quantity(material.getQuantity())
                .unit(material.getUnit())
                .purchasePrice(material.getPurchasePrice())
                .supplierId(material.getSupplier() != null ? material.getSupplier().getId() : null)
                .supplierName(material.getSupplier() != null ? material.getSupplier().getName() : null)
                .reorderLevel(material.getReorderLevel())
                .lowStock(material.getQuantity().compareTo(new BigDecimal(material.getReorderLevel())) <= 0)
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
