package com.garment.erp.service;

import com.garment.erp.dto.CustomerRequest;
import com.garment.erp.dto.CustomerResponse;
import com.garment.erp.entity.Customer;
import com.garment.erp.entity.Payment;
import com.garment.erp.entity.Sale;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.CustomerRepository;
import com.garment.erp.repository.PaymentRepository;
import com.garment.erp.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;

    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        Page<Customer> customers;
        if (search != null && !search.isEmpty()) {
            customers = customerRepository.findByActiveTrueAndNameContainingIgnoreCase(search, pageable);
        } else {
            customers = customerRepository.findByActiveTrue(pageable);
        }
        return customers.map(this::toResponse);
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return toResponseWithFinancials(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gstNumber(request.getGstNumber())
                .businessName(request.getBusinessName())
                .email(request.getEmail())
                .creditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO)
                .active(request.isActive())
                .build();
        return toResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setGstNumber(request.getGstNumber());
        customer.setBusinessName(request.getBusinessName());
        customer.setEmail(request.getEmail());
        customer.setCreditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO);
        customer.setActive(request.isActive());

        return toResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setActive(false);
        customerRepository.save(customer);
    }

    public List<Sale> getCustomerLedger(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
        return saleRepository.findByCustomerId(customerId);
    }

    public BigDecimal getCustomerOutstanding(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
        BigDecimal totalSales = saleRepository.findByCustomerId(customerId)
                .stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalReceived = paymentRepository.sumAmountByTypeAndReferenceId(
                Payment.PaymentType.CUSTOMER, customerId);
        return totalSales.subtract(totalReceived);
    }

    public List<CustomerResponse> getCustomersWithDues() {
        return customerRepository.findAllActive().stream()
                .map(this::toResponseWithFinancials)
                .filter(r -> r.getOutstanding().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .gstNumber(customer.getGstNumber())
                .businessName(customer.getBusinessName())
                .email(customer.getEmail())
                .creditLimit(customer.getCreditLimit())
                .active(customer.isActive())
                .createdAt(customer.getCreatedAt())
                .totalSales(BigDecimal.ZERO)
                .totalReceived(BigDecimal.ZERO)
                .outstanding(BigDecimal.ZERO)
                .build();
    }

    private CustomerResponse toResponseWithFinancials(Customer customer) {
        BigDecimal totalSales = saleRepository.findByCustomerId(customer.getId())
                .stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalReceived = paymentRepository.sumAmountByTypeAndReferenceId(
                Payment.PaymentType.CUSTOMER, customer.getId());

        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .gstNumber(customer.getGstNumber())
                .businessName(customer.getBusinessName())
                .email(customer.getEmail())
                .creditLimit(customer.getCreditLimit())
                .active(customer.isActive())
                .createdAt(customer.getCreatedAt())
                .totalSales(totalSales)
                .totalReceived(totalReceived)
                .outstanding(totalSales.subtract(totalReceived))
                .build();
    }
}
