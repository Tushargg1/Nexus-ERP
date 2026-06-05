package com.garment.erp.repository;

import com.garment.erp.entity.FinishedProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FinishedProductRepository extends JpaRepository<FinishedProduct, Long> {

    List<FinishedProduct> findByQuantityLessThanEqual(BigDecimal threshold);

    @Query("SELECT f FROM FinishedProduct f WHERE f.quantity <= f.reorderLevel")
    List<FinishedProduct> findLowStock();

    Page<FinishedProduct> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
