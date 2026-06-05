package com.garment.erp.repository;

import com.garment.erp.entity.ClientRegistration;
import com.garment.erp.entity.ClientRegistration.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRegistrationRepository extends JpaRepository<ClientRegistration, Long> {
    List<ClientRegistration> findByStatus(RegistrationStatus status);
    Optional<ClientRegistration> findByEmail(String email);
    boolean existsByEmail(String email);
}
