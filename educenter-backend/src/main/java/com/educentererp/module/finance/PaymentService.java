package com.educentererp.module.finance;

import com.educentererp.common.JsonValues;
import com.educentererp.module.student.Student;
import com.educentererp.module.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    public List<PaymentResponse> list(Long etablissementId) {
        List<Payment> payments = etablissementId == null
                ? paymentRepository.findAll()
                : paymentRepository.findByStudentClasseEtablissementId(etablissementId);
        return payments.stream().map(PaymentService::toResponse).toList();
    }

    public PaymentResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public Payment getEntity(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Paiement introuvable: " + id));
    }

    public PaymentResponse create(Map<String, Object> body) {
        Payment payment = new Payment();
        apply(payment, body);
        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse update(Long id, Map<String, Object> body) {
        Payment payment = getEntity(id);
        apply(payment, body);
        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse markAsPaid(Long id, Map<String, Object> body) {
        Map<String, Object> values = new java.util.HashMap<>(body);
        values.put("status", "PAID");
        values.putIfAbsent("payment_date", LocalDate.now().toString());
        values.put("days_late", 0);
        return update(id, values);
    }

    public void delete(Long id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> findPaid() {
        return paymentRepository.findByStatus("PAID");
    }

    public List<Payment> findPending() {
        return paymentRepository.findByStatus("PENDING");
    }

    private void apply(Payment payment, Map<String, Object> body) {
        if (JsonValues.has(body, "student_id")) {
            Long studentId = JsonValues.id(body, "student_id");
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new NoSuchElementException("Étudiant introuvable: " + studentId));
            payment.setStudent(student);
        }
        if (JsonValues.has(body, "amount")) {
            payment.setAmount(JsonValues.number(body, "amount"));
        }
        if (JsonValues.has(body, "due_date")) {
            payment.setDueDate(JsonValues.date(body, "due_date"));
            payment.setDaysLate(daysLate(payment.getDueDate()));
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
    }

    private static int daysLate(LocalDate dueDate) {
        if (dueDate == null) {
            return 0;
        }
        return (int) Math.max(0, ChronoUnit.DAYS.between(dueDate, LocalDate.now()));
    }

    public static PaymentResponse toResponse(Payment payment) {
        Student student = payment.getStudent();
        String className = "";
        if (student != null && student.getClasse() != null) {
            className = student.getClasse().getName() == null ? "" : student.getClasse().getName();
        }
        return new PaymentResponse(
                JsonValues.idString(payment.getId()),
                student == null ? null : JsonValues.idString(student.getId()),
                className,
                student == null ? "" : student.getFullName(),
                student == null ? "" : student.getPhone(),
                payment.getAmount(),
                JsonValues.dateString(payment.getDueDate()),
                JsonValues.dateString(payment.getPaymentDate()),
                payment.getMethod(),
                payment.getStatus(),
                payment.getNotes(),
                payment.getDaysLate() == null ? daysLate(payment.getDueDate()) : payment.getDaysLate(),
                payment.getPaymentCategory(),
                JsonValues.dateString(payment.getPeriodStartDate()),
                JsonValues.dateString(payment.getPeriodEndDate()),
                payment.getCreatedAt() == null ? null : payment.getCreatedAt().toString()
        );
    }
}
