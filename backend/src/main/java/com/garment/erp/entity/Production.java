package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Production {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private FinishedProduct product;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductionStage stage = ProductionStage.RAW_MATERIAL;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "planned_quantity")
    private Integer plannedQuantity;

    @Column(name = "completed_quantity")
    @Builder.Default
    private Integer completedQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "production", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductionItem> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ProductionStage {
        RAW_MATERIAL, CUTTING, STITCHING, FINISHING, PACKING, COMPLETED
    }
}
