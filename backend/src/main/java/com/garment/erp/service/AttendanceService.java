package com.garment.erp.service;

import com.garment.erp.entity.Attendance;
import com.garment.erp.entity.Employee;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.AttendanceRepository;
import com.garment.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public Attendance markAttendance(Long employeeId, LocalDate date, String status, BigDecimal overtimeHours, String notes) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, date);
        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
        } else {
            attendance = Attendance.builder()
                    .employee(employee)
                    .date(date)
                    .build();
        }

        attendance.setStatus(Attendance.AttendanceStatus.valueOf(status));
        attendance.setOvertimeHours(overtimeHours != null ? overtimeHours : BigDecimal.ZERO);
        attendance.setNotes(notes);

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendance(Long employeeId, int month, int year) {
        return attendanceRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }

    public Map<String, Object> getAttendanceSummary(int month, int year) {
        List<Attendance> attendances = attendanceRepository.findByMonthAndYear(month, year);
        List<Employee> employees = employeeRepository.findByActiveTrue();

        List<Map<String, Object>> summary = new ArrayList<>();
        for (Employee employee : employees) {
            List<Attendance> empAttendances = attendances.stream()
                    .filter(a -> a.getEmployee().getId().equals(employee.getId()))
                    .collect(Collectors.toList());

            long present = empAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            long absent = empAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
            long halfDay = empAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.HALF_DAY).count();
            long leave = empAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.LEAVE).count();
            BigDecimal totalOvertime = empAttendances.stream()
                    .map(Attendance::getOvertimeHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> empSummary = new HashMap<>();
            empSummary.put("employeeId", employee.getId());
            empSummary.put("employeeName", employee.getName());
            empSummary.put("designation", employee.getDesignation());
            empSummary.put("present", present);
            empSummary.put("absent", absent);
            empSummary.put("halfDay", halfDay);
            empSummary.put("leave", leave);
            empSummary.put("totalOvertime", totalOvertime);

            summary.add(empSummary);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("summary", summary);
        return result;
    }
}
