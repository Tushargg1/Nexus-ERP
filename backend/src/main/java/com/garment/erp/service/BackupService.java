package com.garment.erp.service;

import com.garment.erp.entity.*;
import com.garment.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackupService {

    private final BackupRepository backupRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FinishedProductRepository finishedProductRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRepository salaryRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductionRepository productionRepository;

    @Value("${app.backup.path}")
    private String backupPath;

    public List<Backup> getAllBackups() {
        return backupRepository.findAllByOrderByCreatedAtDesc();
    }

    public Backup getBackupById(Long id) {
        return backupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup not found: " + id));
    }

    public Backup triggerBackup() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy_hh-mm-a"));
        String folderName = "Backup_" + timestamp;
        String zipName = folderName + ".zip";
        String zipFullPath = backupPath + zipName;

        Backup backup = Backup.builder()
                .filename(zipName)
                .filePath(zipFullPath)
                .status("RUNNING")
                .build();
        backup = backupRepository.save(backup);

        try {
            File baseDir = new File(backupPath, folderName);
            if (!baseDir.exists()) {
                baseDir.mkdirs();
            }

            exportSuppliers(baseDir);
            exportCustomers(baseDir);
            exportRawMaterials(baseDir);
            exportFinishedGoods(baseDir);
            exportProduction(baseDir);
            exportPurchases(baseDir);
            exportSales(baseDir);
            exportPayments(baseDir);
            exportEmployees(baseDir);
            exportAttendance(baseDir);
            exportSalaries(baseDir);
            exportExpenses(baseDir);

            // Zip the directory
            zipDirectory(baseDir, zipFullPath);

            backup.setStatus("SUCCESS");
            backup.setFileSize(new File(zipFullPath).length());
            log.info("Comprehensive Backup created successfully: {}", zipFullPath);

        } catch (Exception e) {
            backup.setStatus("FAILED");
            log.error("Backup error: {}", e.getMessage(), e);
        }

        return backupRepository.save(backup);
    }

    private void exportSuppliers(File baseDir) throws IOException {
        File dir = new File(baseDir, "01_Suppliers");
        dir.mkdirs();
        List<Supplier> list = supplierRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        for (Supplier s : list) {
            String safeName = sanitizeFilename(s.getName() + " (" + s.getMaterialSupplied() + ")");
            try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, safeName + ".txt")))) {
                w.println("SUPPLIER DETAILS");
                w.println("Name: " + s.getName());
                w.println("Material: " + s.getMaterialSupplied());
                w.println("Mobile: " + s.getMobile());
                w.println("Address: " + s.getAddress());
                w.println("GST Number: " + s.getGstNumber());
                
                w.println("\n--- PURCHASE HISTORY & DUES ---");
                List<Purchase> purchases = purchaseRepository.findBySupplierId(s.getId());
                java.math.BigDecimal totalPurchased = java.math.BigDecimal.ZERO;
                java.math.BigDecimal totalPaid = java.math.BigDecimal.ZERO;
                java.math.BigDecimal totalDue = java.math.BigDecimal.ZERO;
                
                for (Purchase p : purchases) {
                    w.println(String.format("Date: %s | Invoice: %s | Status: %s", p.getPurchaseDate(), p.getInvoiceNo(), p.getStatus()));
                    w.println("Amount: Rs " + p.getTotalAmount() + " | Paid: Rs " + p.getPaidAmount() + " | Pending: Rs " + p.getPendingAmount());
                    w.println("-----------------------------------------");
                    totalPurchased = totalPurchased.add(p.getTotalAmount() != null ? p.getTotalAmount() : java.math.BigDecimal.ZERO);
                    totalPaid = totalPaid.add(p.getPaidAmount() != null ? p.getPaidAmount() : java.math.BigDecimal.ZERO);
                    totalDue = totalDue.add(p.getPendingAmount() != null ? p.getPendingAmount() : java.math.BigDecimal.ZERO);
                }
                w.println("\nSUMMARY: Total Purchased: Rs " + totalPurchased + " | Total Paid: Rs " + totalPaid + " | TOTAL DUE: Rs " + totalDue);
            }
        }
    }

    private void exportCustomers(File baseDir) throws IOException {
        File dir = new File(baseDir, "02_Buyers");
        dir.mkdirs();
        List<Customer> list = customerRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        for (Customer c : list) {
            String businessName = c.getBusinessName() != null && !c.getBusinessName().isEmpty() ? c.getBusinessName() : c.getName();
            String safeName = sanitizeFilename(businessName + " (" + c.getName() + ")");
            try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, safeName + ".txt")))) {
                w.println("BUYER / CUSTOMER DETAILS");
                w.println("Business Name: " + c.getBusinessName());
                w.println("Owner Name: " + c.getName());
                w.println("Phone: " + c.getPhone());
                w.println("Address: " + c.getAddress());
                w.println("GST Number: " + c.getGstNumber());
                
                w.println("\n--- SALES HISTORY & DUES ---");
                List<Sale> sales = saleRepository.findByCustomerId(c.getId());
                java.math.BigDecimal totalSold = java.math.BigDecimal.ZERO;
                java.math.BigDecimal totalReceived = java.math.BigDecimal.ZERO;
                java.math.BigDecimal totalDue = java.math.BigDecimal.ZERO;
                
                for (Sale s : sales) {
                    w.println(String.format("Date: %s | Invoice: %s | Status: %s", s.getSaleDate(), s.getInvoiceNo(), s.getStatus()));
                    w.println("Amount: Rs " + s.getTotalAmount() + " | Received: Rs " + s.getPaidAmount() + " | Pending: Rs " + s.getPendingAmount());
                    w.println("-----------------------------------------");
                    totalSold = totalSold.add(s.getTotalAmount() != null ? s.getTotalAmount() : java.math.BigDecimal.ZERO);
                    totalReceived = totalReceived.add(s.getPaidAmount() != null ? s.getPaidAmount() : java.math.BigDecimal.ZERO);
                    totalDue = totalDue.add(s.getPendingAmount() != null ? s.getPendingAmount() : java.math.BigDecimal.ZERO);
                }
                w.println("\nSUMMARY: Total Sales: Rs " + totalSold + " | Total Received: Rs " + totalReceived + " | TOTAL DUE: Rs " + totalDue);
            }
        }
    }

    private void exportRawMaterials(File baseDir) throws IOException {
        File dir = new File(baseDir, "03_Raw_Materials");
        dir.mkdirs();
        List<RawMaterial> list = rawMaterialRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "RawMaterials_Backup.csv")))) {
            w.println("ID,Name,Category,Unit,Current Stock,Reorder Level,Purchase Price");
            for (RawMaterial rm : list) {
                w.println(String.format("%d,\"%s\",\"%s\",\"%s\",%s,%s,%s",
                        rm.getId(), escapeCsv(rm.getName()), escapeCsv(rm.getCategory()), escapeCsv(rm.getUnit()),
                        rm.getQuantity(), rm.getReorderLevel(), rm.getPurchasePrice()));
            }
        }
    }

    private void exportFinishedGoods(File baseDir) throws IOException {
        File dir = new File(baseDir, "04_Finished_Goods");
        dir.mkdirs();
        List<FinishedProduct> list = finishedProductRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "FinishedGoods_Backup.csv")))) {
            w.println("ID,Name,SKU,Size,Color,Current Stock,Selling Price,Cost Price");
            for (FinishedProduct fp : list) {
                w.println(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%s",
                        fp.getId(), escapeCsv(fp.getName()), escapeCsv(fp.getSku()),
                        escapeCsv(fp.getSize()), escapeCsv(fp.getColor()), fp.getQuantity(), fp.getSellingPrice(), fp.getCostPrice()));
            }
        }
    }

    private void exportPurchases(File baseDir) throws IOException {
        File dir = new File(baseDir, "06_Purchases");
        dir.mkdirs();
        List<Purchase> list = purchaseRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Purchases_Backup.csv")))) {
            w.println("ID,Invoice No,Supplier,Purchase Date,Total Amount,Paid Amount,Pending Amount,Status,Notes");
            for (Purchase p : list) {
                String supplierName = p.getSupplier() != null ? p.getSupplier().getName() : "Unknown";
                w.println(String.format("%d,\"%s\",\"%s\",%s,%s,%s,%s,\"%s\",\"%s\"",
                        p.getId(), escapeCsv(p.getInvoiceNo()), escapeCsv(supplierName), p.getPurchaseDate(),
                        p.getTotalAmount(), p.getPaidAmount(), p.getPendingAmount(), p.getStatus(), escapeCsv(p.getNotes())));
            }
        }
    }

    private void exportSales(File baseDir) throws IOException {
        File dir = new File(baseDir, "07_Sales");
        dir.mkdirs();
        List<Sale> list = saleRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Sales_Backup.csv")))) {
            w.println("ID,Invoice No,Customer,Sale Date,Total Amount,Paid Amount,Pending Amount,Status,Notes");
            for (Sale s : list) {
                String customerName = s.getCustomer() != null ? s.getCustomer().getName() : "Unknown";
                w.println(String.format("%d,\"%s\",\"%s\",%s,%s,%s,%s,\"%s\",\"%s\"",
                        s.getId(), escapeCsv(s.getInvoiceNo()), escapeCsv(customerName), s.getSaleDate(),
                        s.getTotalAmount(), s.getPaidAmount(), s.getPendingAmount(), s.getStatus(), escapeCsv(s.getNotes())));
            }
        }
    }

    private void exportPayments(File baseDir) throws IOException {
        File dir = new File(baseDir, "08_Payments");
        dir.mkdirs();
        List<Payment> list = paymentRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Payments_Backup.csv")))) {
            w.println("ID,Payment Type,Reference ID,Payment Date,Amount,Mode,Transaction Ref,Notes");
            for (Payment p : list) {
                w.println(String.format("%d,\"%s\",%d,%s,%s,\"%s\",\"%s\",\"%s\"",
                        p.getId(), p.getType(), p.getReferenceId(), p.getPaymentDate(), p.getAmount(),
                        escapeCsv(p.getPaymentMode()), escapeCsv(p.getTransactionRef()), escapeCsv(p.getNotes())));
            }
        }
    }

    private void exportEmployees(File baseDir) throws IOException {
        File dir = new File(baseDir, "09_Employees");
        dir.mkdirs();
        List<Employee> list = employeeRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Employees_Backup.csv")))) {
            w.println("ID,Name,Phone,Designation,Base Salary,Join Date,Active");
            for (Employee e : list) {
                w.println(String.format("%d,\"%s\",\"%s\",\"%s\",%s,%s,%b",
                        e.getId(), escapeCsv(e.getName()), escapeCsv(e.getPhone()), escapeCsv(e.getDesignation()),
                        e.getBaseSalary(), e.getJoiningDate(), e.isActive()));
            }
        }
    }

    private void exportAttendance(File baseDir) throws IOException {
        File dir = new File(baseDir, "10_Attendance");
        dir.mkdirs();
        List<Attendance> list = attendanceRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Attendance_Backup.csv")))) {
            w.println("ID,Employee,Date,Status,Overtime Hours");
            for (Attendance a : list) {
                String empName = a.getEmployee() != null ? a.getEmployee().getName() : "Unknown";
                w.println(String.format("%d,\"%s\",%s,\"%s\",%s",
                        a.getId(), escapeCsv(empName), a.getDate(), a.getStatus(), a.getOvertimeHours()));
            }
        }
    }

    private void exportSalaries(File baseDir) throws IOException {
        File dir = new File(baseDir, "11_Salaries");
        dir.mkdirs();
        List<Salary> list = salaryRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Salaries_Backup.csv")))) {
            w.println("ID,Employee,Month,Year,Base Salary,Overtime Pay,Net Salary,Is Paid,Payment Date");
            for (Salary s : list) {
                String empName = s.getEmployee() != null ? s.getEmployee().getName() : "Unknown";
                w.println(String.format("%d,\"%s\",%d,%d,%s,%s,%s,%b,%s",
                        s.getId(), escapeCsv(empName), s.getMonth(), s.getYear(), s.getBasicSalary(),
                        s.getOvertimeAmount(), s.getNetSalary(), s.isPaid(), s.getPaymentDate()));
            }
        }
    }

    private void exportExpenses(File baseDir) throws IOException {
        File dir = new File(baseDir, "12_Expenses");
        dir.mkdirs();
        List<Expense> list = expenseRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Expenses_Backup.csv")))) {
            w.println("ID,Date,Category,Amount,Payment Mode,Receipt No,Description");
            for (Expense e : list) {
                w.println(String.format("%d,%s,\"%s\",%s,\"%s\",\"%s\",\"%s\"",
                        e.getId(), e.getExpenseDate(), escapeCsv(e.getCategory()), e.getAmount(),
                        escapeCsv(e.getPaymentMode()), escapeCsv(e.getReceiptNo()), escapeCsv(e.getDescription())));
            }
        }
    }

    private void exportProduction(File baseDir) throws IOException {
        File dir = new File(baseDir, "05_Ongoing_Production");
        dir.mkdirs();
        List<Production> list = productionRepository.findAll();
        if (list.isEmpty()) {
            writeNoDataFile(dir);
            return;
        }
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "Production_Backup.csv")))) {
            w.println("ID,Product,Planned Quantity,Completed Quantity,Start Date,Completion Date,Stage");
            for (Production p : list) {
                String prodName = p.getProduct() != null ? p.getProduct().getName() : "Unknown";
                w.println(String.format("%d,\"%s\",%d,%d,%s,%s,\"%s\"",
                        p.getId(), escapeCsv(prodName), p.getPlannedQuantity(), p.getCompletedQuantity(),
                        p.getStartDate(), p.getCompletionDate(), p.getStage()));
            }
        }
    }

    private void writeNoDataFile(File dir) throws IOException {
        try (PrintWriter w = new PrintWriter(new FileWriter(new File(dir, "_No_Data_Found.txt")))) {
            w.println("There is no data recorded in the system for this section yet.");
            w.println("Once you add entries in the software, they will automatically be exported here in future backups.");
        }
    }

    private String sanitizeFilename(String input) {
        if (input == null) return "Unknown";
        return input.replaceAll("[^a-zA-Z0-9 \\-\\(\\)]", "_");
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        return input.replace("\"", "\"\"");
    }

    public byte[] downloadBackup(Long id) {
        Backup backup = backupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup not found"));

        try {
            File file = new File(backup.getFilePath());
            if (!file.exists()) {
                throw new RuntimeException("Backup file not found on disk");
            }
            return Files.readAllBytes(file.toPath());
        } catch (Exception e) {
            throw new RuntimeException("Failed to read backup file: " + e.getMessage());
        }
    }

    public void runScheduledBackup() {
        log.info("Running scheduled database backup...");
        triggerBackup();
    }

    private void zipDirectory(File dir, String zipDirName) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(zipDirName);
             ZipOutputStream zos = new ZipOutputStream(fos)) {
            zipFile(dir, dir.getName(), zos);
        }
    }

    private void zipFile(File fileToZip, String fileName, ZipOutputStream zos) throws IOException {
        if (fileToZip.isHidden()) {
            return;
        }
        if (fileToZip.isDirectory()) {
            if (fileName.endsWith("/")) {
                zos.putNextEntry(new ZipEntry(fileName));
                zos.closeEntry();
            } else {
                zos.putNextEntry(new ZipEntry(fileName + "/"));
                zos.closeEntry();
            }
            File[] children = fileToZip.listFiles();
            if (children != null) {
                for (File childFile : children) {
                    zipFile(childFile, fileName + "/" + childFile.getName(), zos);
                }
            }
            return;
        }
        try (FileInputStream fis = new FileInputStream(fileToZip)) {
            ZipEntry zipEntry = new ZipEntry(fileName);
            zos.putNextEntry(zipEntry);
            byte[] bytes = new byte[1024];
            int length;
            while ((length = fis.read(bytes)) >= 0) {
                zos.write(bytes, 0, length);
            }
        }
    }
}
