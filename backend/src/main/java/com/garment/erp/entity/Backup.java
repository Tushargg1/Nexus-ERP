package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Backup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String filename;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(length = 20)
    private String status;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
