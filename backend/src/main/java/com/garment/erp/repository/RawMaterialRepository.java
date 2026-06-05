package com.garment.erp.repository;

import com.garment.erp.entity.RawMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {

    Page<RawMaterial> findAll(Pageable pageable);

    List<RawMaterial> findByQuantityLessThanEqual(BigDecimal threshold);

    @Query("SELECT r FROM RawMaterial r WHERE r.quantity <= r.reorderLevel")
    List<RawMaterial> findLowStock();

    Page<RawMaterial> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
