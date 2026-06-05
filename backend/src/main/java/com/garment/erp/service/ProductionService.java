package com.garment.erp.service;

import com.garment.erp.dto.ProductionRequest;
import com.garment.erp.dto.ProductionResponse;
import com.garment.erp.entity.*;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.FinishedProductRepository;
import com.garment.erp.repository.ProductionRepository;
import com.garment.erp.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final FinishedProductRepository finishedProductRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public Page<ProductionResponse> getAllProductions(Pageable pageable) {
        return productionRepository.findAll(pageable).map(this::toResponse);
    }

    public ProductionResponse getProductionById(Long id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production", "id", id));
        return toResponse(production);
    }

    public ProductionResponse createProduction(ProductionRequest request) {
        FinishedProduct product = finishedProductRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("FinishedProduct", "id", request.getProductId()));

        Production production = Production.builder()
                .product(product)
                .plannedQuantity(request.getPlannedQuantity())
                .startDate(request.getStartDate())
                .stage(Production.ProductionStage.RAW_MATERIAL)
                .notes(request.getNotes())
                .build();

        List<ProductionItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (ProductionRequest.ProductionItemRequest itemReq : request.getItems()) {
                RawMaterial material = rawMaterialRepository.findById(itemReq.getRawMaterialId())
                        .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", itemReq.getRawMaterialId()));

                ProductionItem item = ProductionItem.builder()
                        .production(production)
                        .rawMaterial(material)
                        .quantityUsed(itemReq.getQuantityUsed())
                        .build();
                items.add(item);
            }
        }
        production.setItems(items);

        return toResponse(productionRepository.save(production));
    }

    public ProductionResponse advanceStage(Long id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production", "id", id));

        Production.ProductionStage[] stages = Production.ProductionStage.values();
        int currentIndex = production.getStage().ordinal();

        if (currentIndex < stages.length - 1) {
            production.setStage(stages[currentIndex + 1]);
            if (production.getStage() == Production.ProductionStage.COMPLETED) {
                production.setCompletionDate(java.time.LocalDate.now());
                production.setCompletedQuantity(production.getPlannedQuantity());
                // Add to finished product stock
                FinishedProduct product = production.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity().add(
                            java.math.BigDecimal.valueOf(production.getPlannedQuantity())));
                    finishedProductRepository.save(product);
                }
            }
        }

        return toResponse(productionRepository.save(production));
    }

    public List<ProductionResponse> getActiveProductions() {
        return productionRepository.findByStageNot(Production.ProductionStage.COMPLETED)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ProductionResponse toResponse(Production production) {
        List<ProductionResponse.ProductionItemResponse> items = production.getItems().stream()
                .map(item -> ProductionResponse.ProductionItemResponse.builder()
                        .id(item.getId())
                        .rawMaterialId(item.getRawMaterial() != null ? item.getRawMaterial().getId() : null)
                        .rawMaterialName(item.getRawMaterial() != null ? item.getRawMaterial().getName() : null)
                        .quantityUsed(item.getQuantityUsed())
                        .build())
                .collect(Collectors.toList());

        return ProductionResponse.builder()
                .id(production.getId())
                .productId(production.getProduct() != null ? production.getProduct().getId() : null)
                .productName(production.getProduct() != null ? production.getProduct().getName() : null)
                .stage(production.getStage().name())
                .startDate(production.getStartDate())
                .completionDate(production.getCompletionDate())
                .plannedQuantity(production.getPlannedQuantity())
                .completedQuantity(production.getCompletedQuantity())
                .notes(production.getNotes())
                .items(items)
                .createdAt(production.getCreatedAt())
                .build();
    }
}
