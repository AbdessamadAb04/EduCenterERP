package com.educentererp.module.finance;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.savePayment(payment);
    }

    @GetMapping("/student/{studentId}")
    public List<Payment> getByStudent(@PathVariable Long studentId) {
        return paymentService.getPaymentsByStudent(studentId);
    }

    @GetMapping("/overdue")
    public List<Payment> getOverdue() {
        return paymentService.getOverduePayments();
    }

    @PutMapping("/{id}/pay")
    public Payment markPaid(@PathVariable Long id, @RequestParam PaymentMethod method) {
        return paymentService.markAsPaid(id, method);
    }

    @GetMapping("/{id}/receipt")
    public void downloadReceipt(@PathVariable Long id, HttpServletResponse response) throws IOException, InterruptedException {
        Payment payment = paymentService.getPaymentById(id);
        if (payment == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String pythonPath = "c:/Users/Dell/Desktop/I-Stock/My Projects/EduCenterERP/.venv/Scripts/python.exe";
        String scriptPath = "c:/Users/Dell/Desktop/I-Stock/My Projects/EduCenterERP/educenter-backend/scripts/generate_receipt.py";
        
        String jsonData = "{\"id\":\"" + payment.getId() + "\", \"student\":\"" + payment.getStudent().getFullName() + "\", \"amount\":\"" + payment.getAmountMad() + "\", \"paymentDate\":\"" + payment.getPaymentDate() + "\", \"method\":\"" + payment.getMethod() + "\"}";
        Path tempFile = Files.createTempFile("receipt_", ".pdf");
        
        ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptPath, jsonData, tempFile.toString());
        pb.inheritIO();
        Process p = pb.start();
        p.waitFor();

        if (p.exitValue() == 0) {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"recu_" + id + ".pdf\"");
            Files.copy(tempFile, response.getOutputStream());
            response.getOutputStream().flush();
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        Files.deleteIfExists(tempFile);
    }
}