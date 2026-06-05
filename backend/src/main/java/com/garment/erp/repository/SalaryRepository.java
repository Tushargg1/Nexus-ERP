package com.garment.erp.repository;

import com.garment.erp.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);

    List<Salary> findByMonthAndYear(Integer month, Integer year);

    List<Salary> findByEmployeeId(Long employeeId);

    @Query("SELECT COALESCE(SUM(s.netSalary), 0) FROM Salary s WHERE MONTH(s.createdAt) = :month AND YEAR(s.createdAt) = :year")
    BigDecimal sumNetSalaryByMonthAndYear(@Param("month") int month, @Param("year") int year);
}
