package com.garment.erp.controller;

import com.garment.erp.dto.PaymentRequest;
import com.garment.erp.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;
    @GetMapping
    public ResponseEntity<?> getPayments(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(service.getPaymentsByType(type));
    }
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(service.createPayment(request));
    }
    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        return ResponseEntity.ok(service.getPaymentSummary());
    }
}
