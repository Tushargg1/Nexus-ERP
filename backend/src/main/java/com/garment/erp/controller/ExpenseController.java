package com.garment.erp.controller;

import com.garment.erp.dto.ExpenseRequest;
import com.garment.erp.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService service;

    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAllExpenses(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(service.createExpense(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(service.updateExpense(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}
