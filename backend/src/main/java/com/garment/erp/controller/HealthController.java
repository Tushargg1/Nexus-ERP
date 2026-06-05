package com.garment.erp.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight, public health endpoint used by the desktop launcher to detect
 * whether THIS Nexus ERP instance is already running on the port (as opposed
 * to some unrelated process). Returns a fixed marker string.
 */
@RestController
@RequestMapping("/api/v1/ping")
public class HealthController {

    public static final String MARKER = "NEXUS_ERP_OK";

    @GetMapping
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(MARKER);
    }
}
