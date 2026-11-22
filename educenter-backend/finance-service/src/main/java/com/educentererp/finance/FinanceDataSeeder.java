package com.educentererp.finance;

import com.educentererp.module.finance.Payment;
import com.educentererp.module.finance.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@ConditionalOnProperty(name = "seed.enabled", havingValue = "true", matchIfMissing = true)
public class FinanceDataSeeder implements CommandLineRunner {

    private final PaymentRepository paymentRepository;
    private final Long etablissementId;

    public FinanceDataSeeder(PaymentRepository paymentRepository,
                             @Value("${seed.etablissement-id:1}") Long etablissementId) {
        this.paymentRepository = paymentRepository;
        this.etablissementId = etablissementId;
    }

    @Override
    public void run(String... args) {
        if (paymentRepository.count() > 0) {
            return;
        }

        createPayment(1L, "Amine Berrada", "0661122334", "Français - FLE Débutant",
                200.0, "REGISTRATION", LocalDate.now().minusMonths(3), LocalDate.now().minusMonths(3),
                "Espèces", "PAID", "Frais d'inscription");
        createPayment(1L, "Amine Berrada", "0661122334", "Français - FLE Débutant",
                500.0, "TUITION", LocalDate.now().plusDays(10), null,
                "Virement", "PENDING", null);
        createPayment(2L, "Kenza Tazi", "0662233445", "Français - FLE Débutant",
                500.0, "TUITION", LocalDate.now().minusDays(10), null,
                "Autre", "OVERDUE", "Retard mensualité");
        createPayment(3L, "Youssef Alami", "0665566778", "Anglais - Business",
                700.0, "TUITION", LocalDate.now().minusDays(5), LocalDate.now().minusDays(6),
                "CIH", "PAID", null);
    }

    private void createPayment(Long studentId, String studentName, String phone, String className,
                               Double amount, String category, LocalDate dueDate, LocalDate paymentDate,
                               String method, String status, String notes) {
        Payment payment = new Payment();
        payment.setStudentId(studentId);
        payment.setStudentName(studentName);
        payment.setPhone(phone);
        payment.setClassName(className);
        payment.setEtablissementId(etablissementId);
        payment.setAmount(amount);
        payment.setPaymentCategory(category);
        payment.setDueDate(dueDate);
        payment.setPaymentDate(paymentDate);
        payment.setMethod(method);
        payment.setStatus(status);
        payment.setNotes(notes);
        long daysLate = paymentDate == null && dueDate.isBefore(LocalDate.now())
                ? ChronoUnit.DAYS.between(dueDate, LocalDate.now())
                : 0;
        payment.setDaysLate((int) daysLate);
        paymentRepository.save(payment);
    }
}
