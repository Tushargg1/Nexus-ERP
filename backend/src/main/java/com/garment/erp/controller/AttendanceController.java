package com.garment.erp.controller;

import com.garment.erp.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService service;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok("Not fully implemented");
    }
}
