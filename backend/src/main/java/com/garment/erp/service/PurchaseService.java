package com.garment.erp.service;


import com.garment.erp.dto.PurchaseRequest;
import com.garment.erp.dto.PurchaseResponse;
import com.garment.erp.entity.*;
import com.garment.erp.security.SecurityUtils;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final PaymentRepository paymentRepository;
    private final PdfService pdfService;
    private final NotificationService notificationService;

    public Page<PurchaseResponse> getAllPurchases(Long supplierId, String status, Pageable pageable) {
        if (supplierId != null) {
            return purchaseRepository.findBySupplierId(supplierId, pageable).map(this::toResponse);
        } else if (status != null) {
            return purchaseRepository.findByStatus(PaymentStatus.valueOf(status), pageable).map(this::toResponse);
        }
        return purchaseRepository.findAll(pageable).map(this::toResponse);
    }

    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));
        return toResponse(purchase);
    }

    public PurchaseResponse createPurchase(PurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        // Generate invoice number
        String invoiceNo = generateInvoiceNo();

        ApprovalStatus appStatus = SecurityUtils.isOwner() ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING;

        Purchase purchase = Purchase.builder()
                .supplier(supplier)
                .invoiceNo(invoiceNo)
                .purchaseDate(request.getPurchaseDate())
                .gstAmount(request.getGstAmount() != null ? request.getGstAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .status(PaymentStatus.PENDING)
                .approvalStatus(appStatus)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<PurchaseItem> items = new ArrayList<>();

        for (PurchaseRequest.PurchaseItemRequest itemReq : request.getItems()) {
            RawMaterial material = rawMaterialRepository.findById(itemReq.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", itemReq.getRawMaterialId()));

            BigDecimal amount = itemReq.getQuantity().multiply(itemReq.getRate());
            subtotal = subtotal.add(amount);

            PurchaseItem item = PurchaseItem.builder()
                    .purchase(purchase)
                    .rawMaterial(material)
                    .quantity(itemReq.getQuantity())
                    .rate(itemReq.getRate())
                    .amount(amount)
                    .build();
            items.add(item);

            // Update raw material quantity
            material.setQuantity(material.getQuantity().add(itemReq.getQuantity()));
            rawMaterialRepository.save(material);
        }

        purchase.setItems(items);
        purchase.setSubtotal(subtotal);
        BigDecimal gstAmount = request.getGstAmount() != null ? request.getGstAmount() : BigDecimal.ZERO;
        purchase.setGstAmount(gstAmount);
        purchase.setTotalAmount(subtotal.add(gstAmount));
        purchase.setPendingAmount(subtotal.add(gstAmount));
        purchase.setPaidAmount(BigDecimal.ZERO);

        Purchase savedPurchase = purchaseRepository.save(purchase);
        
        if (appStatus == ApprovalStatus.PENDING) {
            notificationService.createNotification("APPROVAL_REQUIRED", "Pending Purchase Approval", 
                "A new purchase invoice " + invoiceNo + " was logged by the manager and is awaiting your approval.", "WARNING");
        }

        return toResponse(savedPurchase);
    }

    public PurchaseResponse recordPayment(Long purchaseId, BigDecimal amount, String paymentMode, String transactionRef) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        BigDecimal newPaid = purchase.getPaidAmount().add(amount);
        purchase.setPaidAmount(newPaid);
        purchase.setPendingAmount(purchase.getTotalAmount().subtract(newPaid));

        if (purchase.getPendingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            purchase.setStatus(PaymentStatus.PAID);
            purchase.setPendingAmount(BigDecimal.ZERO);
        } else {
            purchase.setStatus(PaymentStatus.PARTIAL);
        }

        // Save payment record
        Payment payment = Payment.builder()
                .type(Payment.PaymentType.SUPPLIER)
                .referenceId(purchaseId)
                .amount(amount)
                .paymentMode(paymentMode != null ? paymentMode : "CASH")
                .paymentDate(LocalDate.now())
                .transactionRef(transactionRef)
                .build();
        paymentRepository.save(payment);

        return toResponse(purchaseRepository.save(purchase));
    }

    public byte[] generateInvoicePdf(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));
        return pdfService.generatePurchaseBillPdf(purchase);
    }

    private String generateInvoiceNo() {
        int year = LocalDate.now().getYear();
        long count = purchaseRepository.count() + 1;
        return String.format("PUR-%d-%04d", year, count);
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        List<PurchaseResponse.PurchaseItemResponse> items = purchase.getItems().stream()
                .map(item -> PurchaseResponse.PurchaseItemResponse.builder()
                        .id(item.getId())
                        .rawMaterialId(item.getRawMaterial() != null ? item.getRawMaterial().getId() : null)
                        .rawMaterialName(item.getRawMaterial() != null ? item.getRawMaterial().getName() : null)
                        .quantity(item.getQuantity())
                        .rate(item.getRate())
                        .amount(item.getAmount())
                        .build())
                .collect(Collectors.toList());

        return PurchaseResponse.builder()
                .id(purchase.getId())
                .supplierId(purchase.getSupplier() != null ? purchase.getSupplier().getId() : null)
                .supplierName(purchase.getSupplier() != null ? purchase.getSupplier().getName() : null)
                .invoiceNo(purchase.getInvoiceNo())
                .purchaseDate(purchase.getPurchaseDate())
                .subtotal(purchase.getSubtotal())
                .gstAmount(purchase.getGstAmount())
                .totalAmount(purchase.getTotalAmount())
                .paidAmount(purchase.getPaidAmount())
                .pendingAmount(purchase.getPendingAmount())
                .status(purchase.getStatus().name())
                .notes(purchase.getNotes())
                .items(items)
                .createdAt(purchase.getCreatedAt())
                .build();
    }
}
