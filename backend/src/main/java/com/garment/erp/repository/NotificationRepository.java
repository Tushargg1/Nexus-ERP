package com.garment.erp.repository;

import com.garment.erp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByIsReadFalse();

    List<Notification> findAllByOrderByCreatedAtDesc();

    long countByIsReadFalse();
}
