package com.garment.erp.service;


import com.garment.erp.dto.SaleRequest;
import com.garment.erp.dto.SaleResponse;
import com.garment.erp.dto.SaleItemResponse;
import com.garment.erp.entity.*;
import com.garment.erp.exception.InsufficientStockException;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final FinishedProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final PdfService pdfService;

    public Page<SaleResponse> getAllSales(Long customerId, String status, Pageable pageable) {
        if (customerId != null) {
            return saleRepository.findByCustomerId(customerId, pageable).map(this::toResponse);
        } else if (status != null) {
            return saleRepository.findByStatus(PaymentStatus.valueOf(status), pageable).map(this::toResponse);
        }
        return saleRepository.findAll(pageable).map(this::toResponse);
    }

    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
        return toResponse(sale);
    }

    public SaleResponse createSale(SaleRequest request) {
        // Validate stock first
        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            FinishedProduct product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("FinishedProduct", "id", itemReq.getProductId()));

            if (product.getQuantity().compareTo(itemReq.getQuantity()) < 0) {
                throw new InsufficientStockException(
                        product.getName(),
                        itemReq.getQuantity().doubleValue(),
                        product.getQuantity().doubleValue()
                );
            }
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        String invoiceNo = generateInvoiceNo();

        Sale sale = Sale.builder()
                .customer(customer)
                .customerName(customer != null ? customer.getName() : request.getCustomerName())
                .invoiceNo(invoiceNo)
                .saleDate(request.getSaleDate())
                .gstType(request.getGstType())
                .notes(request.getNotes())
                .status(PaymentStatus.PENDING)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal cgstTotal = BigDecimal.ZERO;
        BigDecimal sgstTotal = BigDecimal.ZERO;
        BigDecimal igstTotal = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            FinishedProduct product = productRepository.findById(itemReq.getProductId()).get();

            BigDecimal baseAmount = itemReq.getQuantity().multiply(itemReq.getRate());
            BigDecimal gstAmount = baseAmount.multiply(itemReq.getGstPercent())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = baseAmount.add(gstAmount);

            subtotal = subtotal.add(baseAmount);

            if ("IGST".equals(request.getGstType())) {
                igstTotal = igstTotal.add(gstAmount);
            } else {
                BigDecimal halfGst = gstAmount.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                cgstTotal = cgstTotal.add(halfGst);
                sgstTotal = sgstTotal.add(halfGst);
            }

            SaleItem item = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .rate(itemReq.getRate())
                    .gstPercent(itemReq.getGstPercent())
                    .amount(totalAmount)
                    .build();
            items.add(item);

            // Decrement stock
            product.setQuantity(product.getQuantity().subtract(itemReq.getQuantity()));
            productRepository.save(product);
        }

        BigDecimal totalGst = cgstTotal.add(sgstTotal).add(igstTotal);
        BigDecimal totalAmount = subtotal.add(totalGst);

        sale.setItems(items);
        sale.setSubtotal(subtotal);
        sale.setCgstAmount(cgstTotal);
        sale.setSgstAmount(sgstTotal);
        sale.setIgstAmount(igstTotal);
        sale.setTotalAmount(totalAmount);
        sale.setPendingAmount(totalAmount);
        sale.setPaidAmount(BigDecimal.ZERO);

        return toResponse(saleRepository.save(sale));
    }

    public SaleResponse recordPayment(Long saleId, BigDecimal amount, String paymentMode, String transactionRef) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", saleId));

        BigDecimal newPaid = sale.getPaidAmount().add(amount);
        sale.setPaidAmount(newPaid);
        sale.setPendingAmount(sale.getTotalAmount().subtract(newPaid));

        if (sale.getPendingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            sale.setStatus(PaymentStatus.PAID);
            sale.setPendingAmount(BigDecimal.ZERO);
        } else {
            sale.setStatus(PaymentStatus.PARTIAL);
        }

        Payment payment = Payment.builder()
                .type(Payment.PaymentType.CUSTOMER)
                .referenceId(saleId)
                .amount(amount)
                .paymentMode(paymentMode != null ? paymentMode : "CASH")
                .paymentDate(LocalDate.now())
                .transactionRef(transactionRef)
                .build();
        paymentRepository.save(payment);

        return toResponse(saleRepository.save(sale));
    }

    public byte[] generateInvoicePdf(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
        return pdfService.generateSalesInvoicePdf(sale);
    }

    private String generateInvoiceNo() {
        int year = LocalDate.now().getYear();
        long count = saleRepository.count() + 1;
        return String.format("INV-%d-%04d", year, count);
    }

    private SaleResponse toResponse(Sale sale) {
        List<SaleItemResponse> items = sale.getItems().stream()
                .map(item -> SaleItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                        .quantity(item.getQuantity())
                        .rate(item.getRate())
                        .gstPercent(item.getGstPercent())
                        .amount(item.getAmount())
                        .build())
                .collect(Collectors.toList());

        return SaleResponse.builder()
                .id(sale.getId())
                .customerId(sale.getCustomer() != null ? sale.getCustomer().getId() : null)
                .customerName(sale.getCustomerName())
                .invoiceNo(sale.getInvoiceNo())
                .saleDate(sale.getSaleDate())
                .subtotal(sale.getSubtotal())
                .cgstAmount(sale.getCgstAmount())
                .sgstAmount(sale.getSgstAmount())
                .igstAmount(sale.getIgstAmount())
                .totalAmount(sale.getTotalAmount())
                .paidAmount(sale.getPaidAmount())
                .pendingAmount(sale.getPendingAmount())
                .status(sale.getStatus().name())
                .gstType(sale.getGstType())
                .notes(sale.getNotes())
                .items(items)
                .createdAt(sale.getCreatedAt())
                .build();
    }
}
