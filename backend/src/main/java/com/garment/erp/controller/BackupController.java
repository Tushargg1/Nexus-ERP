package com.garment.erp.controller;

import com.garment.erp.entity.Backup;
import com.garment.erp.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backup")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','ADMIN')")
public class BackupController {
    private final BackupService service;

    @GetMapping
    public ResponseEntity<List<Backup>> getAll() {
        return ResponseEntity.ok(service.getAllBackups());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> trigger() {
        Backup backup = service.triggerBackup();
        return ResponseEntity.ok(Map.of(
            "id", backup.getId(),
            "filename", backup.getFilename(),
            "status", backup.getStatus() != null ? backup.getStatus() : "SUCCESS",
            "fileSize", backup.getFileSize() != null ? backup.getFileSize() : 0
        ));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        byte[] data = service.downloadBackup(id);
        Backup backup = service.getBackupById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", backup.getFilename());
        headers.setContentLength(data.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
}

