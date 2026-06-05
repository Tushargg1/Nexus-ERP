package com.garment.erp.service;

import com.garment.erp.dto.PaymentRequest;
import com.garment.erp.dto.PaymentResponse;
import com.garment.erp.entity.Payment;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<PaymentResponse> getPaymentsByType(String type) {
        if (type != null) {
            return paymentRepository.findByType(Payment.PaymentType.valueOf(type))
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return paymentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PaymentResponse createPayment(PaymentRequest request) {
        Payment payment = Payment.builder()
                .type(Payment.PaymentType.valueOf(request.getType()))
                .referenceId(request.getReferenceId())
                .amount(request.getAmount())
                .paymentMode(request.getPaymentMode())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .transactionRef(request.getTransactionRef())
                .notes(request.getNotes())
                .build();
        return toResponse(paymentRepository.save(payment));
    }

    public Map<String, BigDecimal> getPaymentSummary() {
        BigDecimal supplierPaid = paymentRepository.findByType(Payment.PaymentType.SUPPLIER)
                .stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal customerReceived = paymentRepository.findByType(Payment.PaymentType.CUSTOMER)
                .stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "supplierPaid", supplierPaid,
                "customerReceived", customerReceived
        );
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .type(payment.getType().name())
                .referenceId(payment.getReferenceId())
                .amount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .paymentDate(payment.getPaymentDate())
                .transactionRef(payment.getTransactionRef())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
