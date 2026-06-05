package com.garment.erp.repository;

import com.garment.erp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM Attendance a WHERE MONTH(a.date) = :month AND YEAR(a.date) = :year")
    List<Attendance> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND MONTH(a.date) = :month AND YEAR(a.date) = :year")
    List<Attendance> findByEmployeeIdAndMonthAndYear(@Param("employeeId") Long employeeId,
                                                      @Param("month") int month,
                                                      @Param("year") int year);
}
