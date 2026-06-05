package com.garment.erp.repository;

import com.garment.erp.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByActiveTrue();
    Page<Supplier> findByActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Supplier> findByActiveTrue(Pageable pageable);
}
