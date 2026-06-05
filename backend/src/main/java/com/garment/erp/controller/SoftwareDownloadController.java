package com.garment.erp.controller;

import com.garment.erp.service.ClientRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;

/**
 * Serves the actual ERP software installer — but ONLY to clients whose license
 * has been approved by an admin. The approval is re-checked server-side at
 * download time, so a revoked client cannot download even with a stale UI.
 */
@RestController
@RequestMapping("/api/v1/software")
@RequiredArgsConstructor
public class SoftwareDownloadController {

    private final ClientRegistrationService registrationService;

    /**
     * Optional external path to the installer package. If set and the file
     * exists, it is served. Otherwise the bundled placeholder is used.
     * Configure with INSTALLER_PATH env var or app.installer.path property.
     */
    @Value("${app.installer.path:}")
    private String installerPath;

    private static final String DOWNLOAD_FILENAME = "nexus-erp-pro-v2.4.1.zip";

    @GetMapping("/download")
    public ResponseEntity<?> download(@RequestParam String email) {
        // Gate: only approved clients (or internal users) may download
        if (!registrationService.verifyLicense(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("{\"message\":\"Your license is not approved. Download is not available.\"}");
        }

        try {
            byte[] data;
            String filename = DOWNLOAD_FILENAME;

            // 1. Prefer an externally configured installer file
            if (installerPath != null && !installerPath.isBlank()) {
                File f = new File(installerPath);
                if (f.exists() && f.isFile()) {
                    data = Files.readAllBytes(f.toPath());
                    filename = f.getName();
                    return streamFile(data, filename);
                }
            }

            // 2. Fall back to a bundled installer resource if present
            ClassPathResource bundled = new ClassPathResource("installer/" + DOWNLOAD_FILENAME);
            if (bundled.exists()) {
                try (InputStream in = bundled.getInputStream()) {
                    data = in.readAllBytes();
                }
                return streamFile(data, DOWNLOAD_FILENAME);
            }

            // 3. Nothing available yet — return a clear, valid error (not a broken file)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"message\":\"The installer is not available yet. Please contact support.\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"message\":\"Failed to prepare the download.\"}");
        }
    }

    private ResponseEntity<byte[]> streamFile(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(data.length);
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
