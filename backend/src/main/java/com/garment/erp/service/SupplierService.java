package com.garment.erp.service;

import com.garment.erp.dto.SupplierRequest;
import com.garment.erp.dto.SupplierResponse;
import com.garment.erp.entity.Payment;
import com.garment.erp.entity.Purchase;
import com.garment.erp.entity.Supplier;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.PaymentRepository;
import com.garment.erp.repository.PurchaseRepository;
import com.garment.erp.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final PaymentRepository paymentRepository;

    public Page<SupplierResponse> getAllSuppliers(String search, Pageable pageable) {
        Page<Supplier> suppliers;
        if (search != null && !search.isEmpty()) {
            suppliers = supplierRepository.findByActiveTrueAndNameContainingIgnoreCase(search, pageable);
        } else {
            suppliers = supplierRepository.findByActiveTrue(pageable);
        }
        return suppliers.map(this::toResponse);
    }

    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return toResponseWithFinancials(supplier);
    }

    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .address(request.getAddress())
                .gstNumber(request.getGstNumber())
                .materialSupplied(request.getMaterialSupplied())
                .email(request.getEmail())
                .bankAccount(request.getBankAccount())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .active(request.isActive())
                .build();
        return toResponse(supplierRepository.save(supplier));
    }

    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplier.setName(request.getName());
        supplier.setMobile(request.getMobile());
        supplier.setAddress(request.getAddress());
        supplier.setGstNumber(request.getGstNumber());
        supplier.setMaterialSupplied(request.getMaterialSupplied());
        supplier.setEmail(request.getEmail());
        supplier.setBankAccount(request.getBankAccount());
        supplier.setBankName(request.getBankName());
        supplier.setIfscCode(request.getIfscCode());
        supplier.setActive(request.isActive());

        return toResponse(supplierRepository.save(supplier));
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    public List<Purchase> getSupplierLedger(Long supplierId) {
        supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        return purchaseRepository.findBySupplierId(supplierId);
    }

    public BigDecimal getSupplierOutstanding(Long supplierId) {
        supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        BigDecimal totalPurchases = purchaseRepository.findBySupplierId(supplierId)
                .stream()
                .map(Purchase::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = paymentRepository.sumAmountByTypeAndReferenceId(
                Payment.PaymentType.SUPPLIER, supplierId);
        return totalPurchases.subtract(totalPaid);
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .mobile(supplier.getMobile())
                .address(supplier.getAddress())
                .gstNumber(supplier.getGstNumber())
                .materialSupplied(supplier.getMaterialSupplied())
                .email(supplier.getEmail())
                .bankAccount(supplier.getBankAccount())
                .bankName(supplier.getBankName())
                .ifscCode(supplier.getIfscCode())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .totalPurchases(BigDecimal.ZERO)
                .totalPaid(BigDecimal.ZERO)
                .outstanding(BigDecimal.ZERO)
                .build();
    }

    private SupplierResponse toResponseWithFinancials(Supplier supplier) {
        BigDecimal totalPurchases = purchaseRepository.findBySupplierId(supplier.getId())
                .stream()
                .map(Purchase::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = paymentRepository.sumAmountByTypeAndReferenceId(
                Payment.PaymentType.SUPPLIER, supplier.getId());

        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .mobile(supplier.getMobile())
                .address(supplier.getAddress())
                .gstNumber(supplier.getGstNumber())
                .materialSupplied(supplier.getMaterialSupplied())
                .email(supplier.getEmail())
                .bankAccount(supplier.getBankAccount())
                .bankName(supplier.getBankName())
                .ifscCode(supplier.getIfscCode())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .totalPurchases(totalPurchases)
                .totalPaid(totalPaid)
                .outstanding(totalPurchases.subtract(totalPaid))
                .build();
    }
}
