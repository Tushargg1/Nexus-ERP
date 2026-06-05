package com.garment.erp.controller;

import com.garment.erp.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> getPendingApprovals() {
        return ResponseEntity.ok(approvalService.getAllPendingApprovals());
    }

    @PostMapping("/{type}/{id}/approve")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> approve(@PathVariable String type, @PathVariable Long id) {
        approvalService.approveEntry(type, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{type}/{id}/reject")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> reject(@PathVariable String type, @PathVariable Long id) {
        approvalService.rejectEntry(type, id);
        return ResponseEntity.ok().build();
    }
}
