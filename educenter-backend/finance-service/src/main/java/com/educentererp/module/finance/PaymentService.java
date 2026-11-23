package com.educentererp.module.finance;

import com.educentererp.common.JsonValues;
import com.educentererp.common.dto.ClassResponse;
import com.educentererp.common.dto.EtablissementResponse;
import com.educentererp.common.dto.PaymentResponse;
import com.educentererp.common.dto.StudentResponse;
import com.educentererp.common.dto.request.PaymentRequest;
import com.educentererp.finance.client.ClassClient;
import com.educentererp.finance.client.EtablissementClient;
import com.educentererp.finance.client.StudentClient;
import com.educentererp.module.idempotency.IdempotencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentClient studentClient;
    private final ClassClient classClient;
    private final EtablissementClient etablissementClient;
    private final IdempotencyService idempotencyService;

    public List<PaymentResponse> list(Long etablissementId) {
        List<Payment> payments = etablissementId == null
                ? paymentRepository.findAll()
                : paymentRepository.findByEtablissementId(etablissementId);
        return payments.stream().map(PaymentService::toResponse).toList();
    }

    public PaymentResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public Payment getEntity(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Paiement introuvable: " + id));
    }

    public PaymentResponse create(Map<String, Object> body, String idempotencyKey) {
        return idempotencyService.replay(idempotencyKey, body, PaymentResponse.class)
                .orElseGet(() -> {
                    Payment payment = new Payment();
                    apply(payment, body);
                    PaymentResponse response = toResponse(paymentRepository.save(payment));
                    idempotencyService.store(idempotencyKey, body, response);
                    return response;
                });
    }

    public PaymentResponse create(PaymentRequest body, String idempotencyKey) {
        return create(body.toMap(), idempotencyKey);
    }

    public PaymentResponse update(Long id, Map<String, Object> body) {
        Payment payment = getEntity(id);
        apply(payment, body);
        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse markAsPaid(Long id, Map<String, Object> body) {
        Payment payment = getEntity(id);
        applyPaymentFields(payment, body);
        return toResponse(paymentRepository.save(payment));
    }

    public void delete(Long id) {
        paymentRepository.deleteById(id);
    }

    public long countByStudentId(Long studentId) {
        return paymentRepository.countByStudentId(studentId);
    }

    public List<Payment> findPaid() {
        return paymentRepository.findByStatus("PAID");
    }

    public List<Payment> findPending() {
        return paymentRepository.findByStatus("PENDING");
    }

    private void apply(Payment payment, Map<String, Object> body) {
        Long studentId = JsonValues.id(body, "student_id");
        if (studentId != null) {
            StudentResponse student = studentClient.get(studentId);
            payment.setStudentId(studentId);
            payment.setStudentName(student.full_name());
            payment.setPhone(student.phone());

            Long classId = parseId(student.classe_id());
            if (classId != null) {
                ClassResponse classe = classClient.get(classId);
                payment.setClassName(classe.name());
                payment.setEtablissementId(parseId(classe.etablissement_id()));
                if (payment.getEtablissementId() != null) {
                    EtablissementResponse etablissement = etablissementClient.get(payment.getEtablissementId());
                    payment.setEtablissementName(etablissement.center_name());
                }
            }
        }
        if (JsonValues.has(body, "etablissement_id")) {
            Long etablissementId = JsonValues.id(body, "etablissement_id");
            payment.setEtablissementId(etablissementId);
            if (etablissementId != null) {
                EtablissementResponse etablissement = etablissementClient.get(etablissementId);
                payment.setEtablissementName(etablissement.center_name());
            } else {
                payment.setEtablissementName(null);
            }
        }
        if (JsonValues.has(body, "student")) {
            payment.setStudentName(JsonValues.string(body, "student"));
        }
        if (JsonValues.has(body, "phone")) {
            payment.setPhone(JsonValues.string(body, "phone"));
        }
        if (JsonValues.has(body, "class")) {
            payment.setClassName(JsonValues.string(body, "class"));
        }
        if (JsonValues.has(body, "amount")) {
            payment.setAmount(JsonValues.number(body, "amount"));
        }
        if (JsonValues.has(body, "due_date")) {
            payment.setDueDate(JsonValues.date(body, "due_date"));
        }
        if (JsonValues.has(body, "payment_date")) {
            payment.setPaymentDate(JsonValues.date(body, "payment_date"));
        }
        if (JsonValues.has(body, "method")) {
            payment.setMethod(JsonValues.string(body, "method"));
        }
        if (JsonValues.has(body, "status")) {
            payment.setStatus(JsonValues.string(body, "status"));
        }
        if (JsonValues.has(body, "notes")) {
            payment.setNotes(JsonValues.string(body, "notes"));
        }
        if (JsonValues.has(body, "payment_category")) {
            payment.setPaymentCategory(JsonValues.string(body, "payment_category"));
        }
        if (JsonValues.has(body, "period_start_date")) {
            payment.setPeriodStartDate(JsonValues.date(body, "period_start_date"));
        }
        if (JsonValues.has(body, "period_end_date")) {
            payment.setPeriodEndDate(JsonValues.date(body, "period_end_date"));
        }
        if (JsonValues.has(body, "days_late")) {
            payment.setDaysLate(JsonValues.integer(body, "days_late"));
        }
        normalizePayment(payment);
    }

    private void applyPaymentFields(Payment payment, Map<String, Object> body) {
        if (JsonValues.has(body, "method")) {
            payment.setMethod(JsonValues.string(body, "method"));
        }
        if (JsonValues.has(body, "notes")) {
            payment.setNotes(JsonValues.string(body, "notes"));
        }
        LocalDate paymentDate = JsonValues.has(body, "payment_date")
                ? JsonValues.date(body, "payment_date")
                : LocalDate.now();
        payment.setPaymentDate(paymentDate);
        payment.setStatus("PAID");
        normalizePayment(payment);
    }

    private void normalizePayment(Payment payment) {
        if (payment.getAmount() == null) {
            payment.setAmount(0.0);
        }
        if (payment.getStatus() == null || payment.getStatus().isBlank()) {
            payment.setStatus("PENDING");
        }
        if (payment.getPaymentCategory() == null || payment.getPaymentCategory().isBlank()) {
            payment.setPaymentCategory("TUITION");
        }
        if (payment.getDaysLate() == null) {
            payment.setDaysLate(0);
        }
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Identifiant invalide: " + value);
        }
    }

    public static PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                JsonValues.idString(payment.getId()),
                JsonValues.idString(payment.getStudentId()),
                payment.getClassName(),
                payment.getStudentName(),
                payment.getPhone(),
                payment.getAmount() == null ? 0.0 : payment.getAmount(),
                JsonValues.dateString(payment.getDueDate()),
                JsonValues.dateString(payment.getPaymentDate()),
                payment.getMethod(),
                payment.getStatus(),
                payment.getNotes(),
                payment.getDaysLate(),
                payment.getPaymentCategory(),
                JsonValues.dateString(payment.getPeriodStartDate()),
                JsonValues.dateString(payment.getPeriodEndDate()),
                payment.getCreatedAt() == null ? null : payment.getCreatedAt().toString(),
                JsonValues.idString(payment.getEtablissementId()),
                payment.getEtablissementName()
        );
    }
}
