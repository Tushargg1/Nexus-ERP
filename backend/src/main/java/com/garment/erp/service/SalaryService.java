package com.garment.erp.service;

import com.garment.erp.dto.SalaryRequest;
import com.garment.erp.dto.SalaryResponse;
import com.garment.erp.entity.Attendance;
import com.garment.erp.entity.Employee;
import com.garment.erp.entity.Salary;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.AttendanceRepository;
import com.garment.erp.repository.EmployeeRepository;
import com.garment.erp.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PdfService pdfService;

    public SalaryResponse generateSalary(SalaryRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        // Check if already generated
        salaryRepository.findByEmployeeIdAndMonthAndYear(request.getEmployeeId(), request.getMonth(), request.getYear())
                .ifPresent(s -> {
                    throw new IllegalArgumentException("Salary already generated for " + employee.getName() +
                            " for " + request.getMonth() + "/" + request.getYear());
                });

        // Calculate based on attendance
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear());

        BigDecimal basicSalary = employee.getBaseSalary();
        BigDecimal overtimeAmount = request.getOvertimeAmount() != null ? request.getOvertimeAmount() : BigDecimal.ZERO;
        BigDecimal advancePaid = request.getAdvancePaid() != null ? request.getAdvancePaid() : BigDecimal.ZERO;
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions() : BigDecimal.ZERO;

        BigDecimal netSalary = basicSalary.add(overtimeAmount).subtract(advancePaid).subtract(deductions);

        Salary salary = Salary.builder()
                .employee(employee)
                .month(request.getMonth())
                .year(request.getYear())
                .basicSalary(basicSalary)
                .advancePaid(advancePaid)
                .overtimeAmount(overtimeAmount)
                .deductions(deductions)
                .netSalary(netSalary.max(BigDecimal.ZERO))
                .isPaid(false)
                .notes(request.getNotes())
                .build();

        return toResponse(salaryRepository.save(salary));
    }

    public List<SalaryResponse> getSalariesByMonthYear(int month, int year) {
        return salaryRepository.findByMonthAndYear(month, year)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SalaryResponse markAsPaid(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary", "id", id));
        salary.setPaid(true);
        salary.setPaymentDate(LocalDate.now());
        return toResponse(salaryRepository.save(salary));
    }

    public byte[] generateSalarySlipPdf(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary", "id", id));
        return pdfService.generateSalarySlipPdf(salary);
    }

    private SalaryResponse toResponse(Salary salary) {
        return SalaryResponse.builder()
                .id(salary.getId())
                .employeeId(salary.getEmployee().getId())
                .employeeName(salary.getEmployee().getName())
                .designation(salary.getEmployee().getDesignation())
                .month(salary.getMonth())
                .year(salary.getYear())
                .basicSalary(salary.getBasicSalary())
                .advancePaid(salary.getAdvancePaid())
                .overtimeAmount(salary.getOvertimeAmount())
                .deductions(salary.getDeductions())
                .netSalary(salary.getNetSalary())
                .isPaid(salary.isPaid())
                .paymentDate(salary.getPaymentDate())
                .notes(salary.getNotes())
                .createdAt(salary.getCreatedAt())
                .build();
    }
}
