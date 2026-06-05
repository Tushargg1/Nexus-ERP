package com.garment.erp.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, double required, double available) {
        super(String.format("Insufficient stock for '%s'. Required: %.2f, Available: %.2f",
                productName, required, available));
    }
}
