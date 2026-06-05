package com.garment.erp.service;

import com.garment.erp.dto.FinishedProductRequest;
import com.garment.erp.dto.FinishedProductResponse;
import com.garment.erp.entity.FinishedProduct;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.FinishedProductRepository;
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
public class FinishedProductService {

    private final FinishedProductRepository productRepository;

    public Page<FinishedProductResponse> getAllProducts(String search, Pageable pageable) {
        Page<FinishedProduct> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::toResponse);
    }

    public FinishedProductResponse getProductById(Long id) {
        FinishedProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedProduct", "id", id));
        return toResponse(product);
    }

    public FinishedProductResponse createProduct(FinishedProductRequest request) {
        FinishedProduct product = FinishedProduct.builder()
                .name(request.getName())
                .size(request.getSize())
                .color(request.getColor())
                .quantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO)
                .sellingPrice(request.getSellingPrice())
                .costPrice(request.getCostPrice())
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .sku(request.getSku())
                .build();
        return toResponse(productRepository.save(product));
    }

    public FinishedProductResponse updateProduct(Long id, FinishedProductRequest request) {
        FinishedProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedProduct", "id", id));

        product.setName(request.getName());
        product.setSize(request.getSize());
        product.setColor(request.getColor());
        product.setSellingPrice(request.getSellingPrice());
        product.setCostPrice(request.getCostPrice());
        product.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : product.getReorderLevel());
        product.setSku(request.getSku());

        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("FinishedProduct", "id", id);
        }
        productRepository.deleteById(id);
    }

    public List<FinishedProductResponse> getLowStockProducts() {
        return productRepository.findLowStock().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FinishedProductResponse adjustQuantity(Long id, BigDecimal newQuantity) {
        FinishedProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinishedProduct", "id", id));
        product.setQuantity(newQuantity);
        return toResponse(productRepository.save(product));
    }

    private FinishedProductResponse toResponse(FinishedProduct product) {
        return FinishedProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .size(product.getSize())
                .color(product.getColor())
                .quantity(product.getQuantity())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .reorderLevel(product.getReorderLevel())
                .sku(product.getSku())
                .lowStock(product.getQuantity().compareTo(new BigDecimal(product.getReorderLevel())) <= 0)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
