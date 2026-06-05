package com.garment.erp.repository;

import com.garment.erp.entity.Backup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BackupRepository extends JpaRepository<Backup, Long> {
    List<Backup> findAllByOrderByCreatedAtDesc();
}
