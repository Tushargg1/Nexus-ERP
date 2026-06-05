package com.garment.erp.controller;

import com.garment.erp.dto.PurchaseRequest;
import com.garment.erp.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/purchase")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService service;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(service.getAllPurchases(supplierId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPurchaseById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(service.createPurchase(request));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<?> recordPayment(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String paymentMode = (String) payload.get("paymentMode");
        String transactionRef = (String) payload.get("transactionRef");
        return ResponseEntity.ok(service.recordPayment(id, amount, paymentMode, transactionRef));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        byte[] pdf = service.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"purchase-" + id + ".pdf\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
                .body(pdf);
    }
}
