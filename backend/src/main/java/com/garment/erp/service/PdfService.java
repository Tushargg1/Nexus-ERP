package com.garment.erp.service;

import com.garment.erp.entity.Purchase;
import com.garment.erp.entity.PurchaseItem;
import com.garment.erp.entity.Salary;
import com.garment.erp.entity.Sale;
import com.garment.erp.entity.SaleItem;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfService {

    @Value("${app.company.name}")
    private String companyName;

    @Value("${app.company.address}")
    private String companyAddress;

    @Value("${app.company.gst}")
    private String companyGst;

    @Value("${app.company.phone}")
    private String companyPhone;

    @Value("${app.company.email}")
    private String companyEmail;

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(33, 37, 41));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(52, 58, 64));
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(73, 80, 87));
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(108, 117, 125));
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font TABLE_CELL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(73, 80, 87));
    private static final Color HEADER_BG = new Color(13, 110, 253);
    private static final Color LIGHT_GRAY = new Color(248, 249, 250);
    private static final Color BORDER_COLOR = new Color(222, 226, 230);

    public byte[] generateSalesInvoicePdf(Sale sale) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4, 40, 40, 60, 40);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Company Header
            addCompanyHeader(document, "SALES INVOICE");

            // Invoice details
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(15);

            // Left: Bill To
            PdfPCell billToCell = new PdfPCell();
            billToCell.setBorder(Rectangle.NO_BORDER);
            billToCell.setPadding(8);
            billToCell.setBackgroundColor(LIGHT_GRAY);
            Paragraph billTo = new Paragraph();
            billTo.add(new Chunk("BILL TO:\n", HEADER_FONT));
            billTo.add(new Chunk(sale.getCustomerName() != null ? sale.getCustomerName() : "Walk-in Customer", NORMAL_FONT));
            if (sale.getCustomer() != null && sale.getCustomer().getGstNumber() != null) {
                billTo.add(new Chunk("\nGST: " + sale.getCustomer().getGstNumber(), SMALL_FONT));
            }
            billToCell.addElement(billTo);

            // Right: Invoice Info
            PdfPCell invoiceInfoCell = new PdfPCell();
            invoiceInfoCell.setBorder(Rectangle.NO_BORDER);
            invoiceInfoCell.setPadding(8);
            invoiceInfoCell.setBackgroundColor(LIGHT_GRAY);
            invoiceInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invoiceInfo = new Paragraph();
            invoiceInfo.setAlignment(Element.ALIGN_RIGHT);
            invoiceInfo.add(new Chunk("Invoice No: " + sale.getInvoiceNo() + "\n", HEADER_FONT));
            invoiceInfo.add(new Chunk("Date: " + sale.getSaleDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "\n", NORMAL_FONT));
            invoiceInfo.add(new Chunk("Status: " + sale.getStatus().name(), NORMAL_FONT));
            invoiceInfoCell.addElement(invoiceInfo);

            infoTable.addCell(billToCell);
            infoTable.addCell(invoiceInfoCell);
            document.add(infoTable);

            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable itemsTable = new PdfPTable(new float[]{40, 10, 15, 15, 10, 10});
            itemsTable.setWidthPercentage(100);
            itemsTable.setSpacingBefore(10);

            String[] headers = {"Product", "Qty", "Rate (₹)", "Amount (₹)", "GST%", "Total (₹)"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, TABLE_HEADER_FONT));
                cell.setBackgroundColor(HEADER_BG);
                cell.setPadding(8);
                cell.setBorderColor(HEADER_BG);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(cell);
            }

            boolean alternate = false;
            for (SaleItem item : sale.getItems()) {
                Color rowBg = alternate ? LIGHT_GRAY : Color.WHITE;
                String productName = item.getProduct() != null ? item.getProduct().getName() : "N/A";
                BigDecimal baseAmt = item.getQuantity().multiply(item.getRate());
                BigDecimal gstAmt = item.getAmount().subtract(baseAmt);

                addItemRow(itemsTable, rowBg,
                        productName,
                        item.getQuantity().toPlainString(),
                        "₹" + item.getRate().toPlainString(),
                        "₹" + baseAmt.toPlainString(),
                        item.getGstPercent() + "%",
                        "₹" + item.getAmount().toPlainString());
                alternate = !alternate;
            }
            document.add(itemsTable);

            // Totals
            PdfPTable totalsTable = new PdfPTable(new float[]{70, 30});
            totalsTable.setWidthPercentage(100);
            totalsTable.setSpacingBefore(5);

            addTotalRow(totalsTable, "Subtotal:", "₹" + sale.getSubtotal().toPlainString(), false);
            if ("IGST".equals(sale.getGstType())) {
                addTotalRow(totalsTable, "IGST:", "₹" + sale.getIgstAmount().toPlainString(), false);
            } else {
                addTotalRow(totalsTable, "CGST:", "₹" + sale.getCgstAmount().toPlainString(), false);
                addTotalRow(totalsTable, "SGST:", "₹" + sale.getSgstAmount().toPlainString(), false);
            }
            addTotalRow(totalsTable, "TOTAL AMOUNT:", "₹" + sale.getTotalAmount().toPlainString(), true);
            addTotalRow(totalsTable, "Paid Amount:", "₹" + sale.getPaidAmount().toPlainString(), false);
            addTotalRow(totalsTable, "Pending Amount:", "₹" + sale.getPendingAmount().toPlainString(), false);
            document.add(totalsTable);

            // Footer
            addFooter(document);

            document.close();
        } catch (Exception e) {
            log.error("Error generating sales invoice PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    public byte[] generatePurchaseBillPdf(Purchase purchase) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4, 40, 40, 60, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            addCompanyHeader(document, "PURCHASE BILL");

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(15);

            PdfPCell supplierCell = new PdfPCell();
            supplierCell.setBorder(Rectangle.NO_BORDER);
            supplierCell.setPadding(8);
            supplierCell.setBackgroundColor(LIGHT_GRAY);
            Paragraph supplierInfo = new Paragraph();
            supplierInfo.add(new Chunk("SUPPLIER:\n", HEADER_FONT));
            supplierInfo.add(new Chunk(purchase.getSupplier() != null ? purchase.getSupplier().getName() : "N/A", NORMAL_FONT));
            if (purchase.getSupplier() != null && purchase.getSupplier().getGstNumber() != null) {
                supplierInfo.add(new Chunk("\nGST: " + purchase.getSupplier().getGstNumber(), SMALL_FONT));
            }
            supplierCell.addElement(supplierInfo);

            PdfPCell purchaseInfoCell = new PdfPCell();
            purchaseInfoCell.setBorder(Rectangle.NO_BORDER);
            purchaseInfoCell.setPadding(8);
            purchaseInfoCell.setBackgroundColor(LIGHT_GRAY);
            purchaseInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph purchaseInfo = new Paragraph();
            purchaseInfo.setAlignment(Element.ALIGN_RIGHT);
            purchaseInfo.add(new Chunk("Invoice No: " + purchase.getInvoiceNo() + "\n", HEADER_FONT));
            purchaseInfo.add(new Chunk("Date: " + purchase.getPurchaseDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "\n", NORMAL_FONT));
            purchaseInfo.add(new Chunk("Status: " + purchase.getStatus().name(), NORMAL_FONT));
            purchaseInfoCell.addElement(purchaseInfo);

            infoTable.addCell(supplierCell);
            infoTable.addCell(purchaseInfoCell);
            document.add(infoTable);

            document.add(new Paragraph(" "));

            PdfPTable itemsTable = new PdfPTable(new float[]{50, 15, 15, 20});
            itemsTable.setWidthPercentage(100);

            String[] headers = {"Material", "Quantity", "Rate (₹)", "Amount (₹)"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, TABLE_HEADER_FONT));
                cell.setBackgroundColor(HEADER_BG);
                cell.setPadding(8);
                cell.setBorderColor(HEADER_BG);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(cell);
            }

            boolean alternate = false;
            for (PurchaseItem item : purchase.getItems()) {
                Color rowBg = alternate ? LIGHT_GRAY : Color.WHITE;
                String materialName = item.getRawMaterial() != null ? item.getRawMaterial().getName() : "N/A";
                addItemRow(itemsTable, rowBg,
                        materialName,
                        item.getQuantity().toPlainString(),
                        "₹" + item.getRate().toPlainString(),
                        "₹" + item.getAmount().toPlainString());
                alternate = !alternate;
            }
            document.add(itemsTable);

            PdfPTable totalsTable = new PdfPTable(new float[]{70, 30});
            totalsTable.setWidthPercentage(100);
            totalsTable.setSpacingBefore(5);
            addTotalRow(totalsTable, "Subtotal:", "₹" + purchase.getSubtotal().toPlainString(), false);
            addTotalRow(totalsTable, "GST Amount:", "₹" + purchase.getGstAmount().toPlainString(), false);
            addTotalRow(totalsTable, "TOTAL AMOUNT:", "₹" + purchase.getTotalAmount().toPlainString(), true);
            addTotalRow(totalsTable, "Paid Amount:", "₹" + purchase.getPaidAmount().toPlainString(), false);
            addTotalRow(totalsTable, "Pending Amount:", "₹" + purchase.getPendingAmount().toPlainString(), false);
            document.add(totalsTable);

            addFooter(document);
            document.close();
        } catch (Exception e) {
            log.error("Error generating purchase bill PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    public byte[] generateSalarySlipPdf(Salary salary) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4, 40, 40, 60, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            addCompanyHeader(document, "SALARY SLIP");

            document.add(new Paragraph(" "));

            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingBefore(10);

            addInfoRow(empTable, "Employee Name:", salary.getEmployee().getName());
            addInfoRow(empTable, "Designation:", salary.getEmployee().getDesignation());
            addInfoRow(empTable, "Pay Period:", getMonthName(salary.getMonth()) + " " + salary.getYear());
            addInfoRow(empTable, "Payment Status:", salary.isPaid() ? "PAID" : "PENDING");
            if (salary.getPaymentDate() != null) {
                addInfoRow(empTable, "Payment Date:", salary.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            }
            document.add(empTable);

            document.add(new Paragraph(" "));

            PdfPTable salaryTable = new PdfPTable(new float[]{60, 40});
            salaryTable.setWidthPercentage(100);
            salaryTable.setSpacingBefore(10);

            // Earnings header
            PdfPCell earningsHeader = new PdfPCell(new Phrase("EARNINGS", TABLE_HEADER_FONT));
            earningsHeader.setBackgroundColor(HEADER_BG);
            earningsHeader.setPadding(8);
            earningsHeader.setColspan(2);
            earningsHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
            salaryTable.addCell(earningsHeader);

            addSalaryRow(salaryTable, "Basic Salary", "₹" + salary.getBasicSalary().toPlainString(), false);
            addSalaryRow(salaryTable, "Overtime Amount", "₹" + salary.getOvertimeAmount().toPlainString(), false);

            PdfPCell deductionsHeader = new PdfPCell(new Phrase("DEDUCTIONS", TABLE_HEADER_FONT));
            deductionsHeader.setBackgroundColor(new Color(220, 53, 69));
            deductionsHeader.setPadding(8);
            deductionsHeader.setColspan(2);
            deductionsHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
            salaryTable.addCell(deductionsHeader);

            addSalaryRow(salaryTable, "Advance Paid", "₹" + salary.getAdvancePaid().toPlainString(), false);
            addSalaryRow(salaryTable, "Other Deductions", "₹" + salary.getDeductions().toPlainString(), false);

            PdfPCell netCell1 = new PdfPCell(new Phrase("NET SALARY", new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE)));
            netCell1.setBackgroundColor(new Color(25, 135, 84));
            netCell1.setPadding(10);
            salaryTable.addCell(netCell1);

            PdfPCell netCell2 = new PdfPCell(new Phrase("₹" + salary.getNetSalary().toPlainString(), new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE)));
            netCell2.setBackgroundColor(new Color(25, 135, 84));
            netCell2.setPadding(10);
            netCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            salaryTable.addCell(netCell2);

            document.add(salaryTable);

            if (salary.getNotes() != null && !salary.getNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Notes: " + salary.getNotes(), SMALL_FONT));
            }

            addFooter(document);
            document.close();
        } catch (Exception e) {
            log.error("Error generating salary slip PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    private void addCompanyHeader(Document document, String docTitle) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);

        PdfPCell headerCell = new PdfPCell();
        headerCell.setBackgroundColor(HEADER_BG);
        headerCell.setBorder(Rectangle.NO_BORDER);
        headerCell.setPadding(15);
        headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph companyPara = new Paragraph();
        companyPara.setAlignment(Element.ALIGN_CENTER);
        companyPara.add(new Chunk(companyName + "\n", new Font(Font.HELVETICA, 16, Font.BOLD, Color.WHITE)));
        companyPara.add(new Chunk(companyAddress + "\n", new Font(Font.HELVETICA, 9, Font.NORMAL, Color.WHITE)));
        companyPara.add(new Chunk("GST: " + companyGst + " | Ph: " + companyPhone + " | " + companyEmail, new Font(Font.HELVETICA, 8, Font.NORMAL, Color.WHITE)));
        headerCell.addElement(companyPara);
        headerTable.addCell(headerCell);

        PdfPCell titleCell = new PdfPCell(new Phrase(docTitle, new Font(Font.HELVETICA, 14, Font.BOLD, new Color(33, 37, 41))));
        titleCell.setBackgroundColor(new Color(233, 236, 239));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPadding(10);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerTable.addCell(titleCell);

        document.add(headerTable);
    }

    private void addItemRow(PdfPTable table, Color bgColor, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, TABLE_CELL_FONT));
            cell.setBackgroundColor(bgColor);
            cell.setPadding(6);
            cell.setBorderColor(BORDER_COLOR);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(cell);
        }
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean highlight) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, highlight ? HEADER_FONT : NORMAL_FONT));
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(6);
        labelCell.setBorderColor(BORDER_COLOR);
        if (highlight) labelCell.setBackgroundColor(LIGHT_GRAY);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, highlight ? HEADER_FONT : NORMAL_FONT));
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(6);
        valueCell.setBorderColor(BORDER_COLOR);
        if (highlight) valueCell.setBackgroundColor(LIGHT_GRAY);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addInfoRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, HEADER_FONT));
        labelCell.setPadding(6);
        labelCell.setBorderColor(BORDER_COLOR);
        labelCell.setBackgroundColor(LIGHT_GRAY);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "N/A", NORMAL_FONT));
        valueCell.setPadding(6);
        valueCell.setBorderColor(BORDER_COLOR);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addSalaryRow(PdfPTable table, String label, String value, boolean bold) {
        Font f = bold ? HEADER_FONT : NORMAL_FONT;
        PdfPCell c1 = new PdfPCell(new Phrase(label, f));
        c1.setPadding(7);
        c1.setBorderColor(BORDER_COLOR);
        PdfPCell c2 = new PdfPCell(new Phrase(value, f));
        c2.setPadding(7);
        c2.setBorderColor(BORDER_COLOR);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c1);
        table.addCell(c2);
    }

    private void addFooter(Document document) throws DocumentException {
        document.add(new Paragraph(" "));
        Paragraph footer = new Paragraph("This is a computer-generated document. No signature required.", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
        Paragraph thankYou = new Paragraph("Thank you for your business!", new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(108, 117, 125)));
        thankYou.setAlignment(Element.ALIGN_CENTER);
        document.add(thankYou);
    }

    private String getMonthName(int month) {
        String[] months = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return months[month - 1];
    }
}
