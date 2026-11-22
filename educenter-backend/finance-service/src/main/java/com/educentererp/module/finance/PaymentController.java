package com.educentererp.module.finance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.educentererp.common.JsonValues;
import com.educentererp.common.dto.PaymentResponse;
import com.educentererp.common.dto.request.PaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${receipt.python-path:python}")
    private String pythonPath;

    @Value("${receipt.script-path:scripts/generate_receipt.py}")
    private String scriptPath;

    @GetMapping
    public List<PaymentResponse> list(@RequestParam(name = "etablissement_id", required = false) Long etablissementId) {
        return paymentService.list(etablissementId);
    }

    @GetMapping("/count")
    public long count(@RequestParam(name = "student_id") Long studentId) {
        return paymentService.countByStudentId(studentId);
    }

    @GetMapping("/{id}")
    public PaymentResponse get(@PathVariable Long id) {
        return paymentService.get(id);
    }

    @PostMapping
    public PaymentResponse create(@Valid @RequestBody PaymentRequest body) {
        return paymentService.create(body.toMap());
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return paymentService.update(id, body);
    }

    @PutMapping("/{id}/pay")
    public PaymentResponse markAsPaid(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        return paymentService.markAsPaid(id, body == null ? Map.of() : body);
    }

    @PutMapping("/{id}/archive")
    public PaymentResponse archive(@PathVariable Long id) {
        return paymentService.update(id, Map.of("status", "ARCHIVED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/receipt")
    public void downloadReceipt(@PathVariable Long id, HttpServletResponse response)
            throws IOException, InterruptedException {
        Payment payment = paymentService.getEntity(id);

        Map<String, Object> receiptData = new LinkedHashMap<>();
        receiptData.put("id", JsonValues.idString(payment.getId()));
        receiptData.put("student", payment.getStudentName() == null ? "" : payment.getStudentName());
        receiptData.put("amount", payment.getAmount());
        receiptData.put("paymentDate", JsonValues.dateString(payment.getPaymentDate()));
        receiptData.put("method", payment.getMethod());
        String json = objectMapper.writeValueAsString(receiptData);

        Path tempFile = Files.createTempFile("receipt_", ".pdf");
        try {
            ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptPath, json, tempFile.toString());
            pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
            pb.redirectError(ProcessBuilder.Redirect.DISCARD);
            Process process = pb.start();
            if (!process.waitFor(30, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                process.waitFor();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            if (process.exitValue() == 0) {
                response.setContentType("application/pdf");
                response.setHeader("Content-Disposition", "attachment; filename=\"recu_" + id + ".pdf\"");
                Files.copy(tempFile, response.getOutputStream());
                response.getOutputStream().flush();
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }
}
