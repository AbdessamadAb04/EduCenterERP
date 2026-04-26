package com.educentererp.module.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment savePayment(Payment payment) {

        // Enforce default status
        if (payment.getStatus() == null) {
            payment.setStatus(PaymentStatus.PENDING);
        }

        // Prevent paymentDate if not paid
        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setPaymentDate(null);
            payment.setMethod(null);
        }

        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByStudent(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    public List<Payment> getOverduePayments() {
        return paymentRepository.findByStatus(PaymentStatus.PENDING).stream()
                .filter(p -> p.getDueDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());
    }

    public Payment markAsPaid(Long paymentId, PaymentMethod method) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentDate(LocalDate.now());
        payment.setMethod(method);
        return paymentRepository.save(payment);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }
}