package com.garment.erp.repository;

import com.garment.erp.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByActiveTrue();
    Page<Customer> findByActiveTrue(Pageable pageable);
    Page<Customer> findByActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.active = true")
    List<Customer> findAllActive();
}
