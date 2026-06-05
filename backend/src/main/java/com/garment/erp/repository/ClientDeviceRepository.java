package com.garment.erp.repository;

import com.garment.erp.entity.ClientDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientDeviceRepository extends JpaRepository<ClientDevice, Long> {
    List<ClientDevice> findByClientEmail(String clientEmail);
    Optional<ClientDevice> findByClientEmailAndDeviceId(String clientEmail, String deviceId);
}
