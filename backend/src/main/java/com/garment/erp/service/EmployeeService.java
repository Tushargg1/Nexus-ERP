package com.garment.erp.service;

import com.garment.erp.dto.EmployeeRequest;
import com.garment.erp.dto.EmployeeResponse;
import com.garment.erp.entity.Attendance;
import com.garment.erp.entity.Employee;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.AttendanceRepository;
import com.garment.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return toResponse(employee);
    }

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Employee employee = Employee.builder()
                .name(request.getName())
                .designation(request.getDesignation())
                .phone(request.getPhone())
                .address(request.getAddress())
                .baseSalary(request.getBaseSalary())
                .joiningDate(request.getJoiningDate())
                .bankAccount(request.getBankAccount())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .active(request.isActive())
                .build();
        return toResponse(employeeRepository.save(employee));
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setName(request.getName());
        employee.setDesignation(request.getDesignation());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        employee.setBaseSalary(request.getBaseSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setBankAccount(request.getBankAccount());
        employee.setBankName(request.getBankName());
        employee.setIfscCode(request.getIfscCode());
        employee.setActive(request.isActive());

        return toResponse(employeeRepository.save(employee));
    }

    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    public List<Attendance> getEmployeeAttendance(Long employeeId, int month, int year) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return attendanceRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }

    private EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .designation(employee.getDesignation())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .baseSalary(employee.getBaseSalary())
                .joiningDate(employee.getJoiningDate())
                .bankAccount(employee.getBankAccount())
                .bankName(employee.getBankName())
                .ifscCode(employee.getIfscCode())
                .active(employee.isActive())
                .createdAt(employee.getCreatedAt())
                .build();
    }
}
