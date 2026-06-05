package com.garment.erp.service;

import com.garment.erp.entity.*;
import com.garment.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final SalaryRepository salaryRepository;
    private final AttendanceRepository attendanceRepository;

    public Map<String, List<?>> getAllPendingApprovals() {
        Map<String, List<?>> pending = new HashMap<>();
        // Note: In a real system, you'd add custom finder methods for approvalStatus=PENDING.
        // For simplicity, we just filter here or assume Repositories have findByApprovalStatus.
        
        pending.put("purchases", purchaseRepository.findAll().stream().filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING).toList());
        pending.put("sales", saleRepository.findAll().stream().filter(s -> s.getApprovalStatus() == ApprovalStatus.PENDING).toList());
        pending.put("payments", paymentRepository.findAll().stream().filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING).toList());
        pending.put("expenses", expenseRepository.findAll().stream().filter(e -> e.getApprovalStatus() == ApprovalStatus.PENDING).toList());
        pending.put("salaries", salaryRepository.findAll().stream().filter(s -> s.getApprovalStatus() == ApprovalStatus.PENDING).toList());
        pending.put("attendance", attendanceRepository.findAll().stream().filter(a -> a.getApprovalStatus() == ApprovalStatus.PENDING).toList());

        return pending;
    }

    public void approveEntry(String type, Long id) {
        switch (type.toLowerCase()) {
            case "purchase" -> {
                Purchase p = purchaseRepository.findById(id).orElseThrow();
                p.setApprovalStatus(ApprovalStatus.APPROVED);
                purchaseRepository.save(p);
            }
            case "sale" -> {
                Sale s = saleRepository.findById(id).orElseThrow();
                s.setApprovalStatus(ApprovalStatus.APPROVED);
                saleRepository.save(s);
            }
            case "payment" -> {
                Payment p = paymentRepository.findById(id).orElseThrow();
                p.setApprovalStatus(ApprovalStatus.APPROVED);
                paymentRepository.save(p);
            }
            case "expense" -> {
                Expense e = expenseRepository.findById(id).orElseThrow();
                e.setApprovalStatus(ApprovalStatus.APPROVED);
                expenseRepository.save(e);
            }
            case "salary" -> {
                Salary s = salaryRepository.findById(id).orElseThrow();
                s.setApprovalStatus(ApprovalStatus.APPROVED);
                salaryRepository.save(s);
            }
            case "attendance" -> {
                Attendance a = attendanceRepository.findById(id).orElseThrow();
                a.setApprovalStatus(ApprovalStatus.APPROVED);
                attendanceRepository.save(a);
            }
        }
    }

    public void rejectEntry(String type, Long id) {
        switch (type.toLowerCase()) {
            case "purchase" -> {
                Purchase p = purchaseRepository.findById(id).orElseThrow();
                p.setApprovalStatus(ApprovalStatus.REJECTED);
                purchaseRepository.save(p);
            }
            case "sale" -> {
                Sale s = saleRepository.findById(id).orElseThrow();
                s.setApprovalStatus(ApprovalStatus.REJECTED);
                saleRepository.save(s);
            }
            case "payment" -> {
                Payment p = paymentRepository.findById(id).orElseThrow();
                p.setApprovalStatus(ApprovalStatus.REJECTED);
                paymentRepository.save(p);
            }
            case "expense" -> {
                Expense e = expenseRepository.findById(id).orElseThrow();
                e.setApprovalStatus(ApprovalStatus.REJECTED);
                expenseRepository.save(e);
            }
            case "salary" -> {
                Salary s = salaryRepository.findById(id).orElseThrow();
                s.setApprovalStatus(ApprovalStatus.REJECTED);
                salaryRepository.save(s);
            }
            case "attendance" -> {
                Attendance a = attendanceRepository.findById(id).orElseThrow();
                a.setApprovalStatus(ApprovalStatus.REJECTED);
                attendanceRepository.save(a);
            }
        }
    }
}
