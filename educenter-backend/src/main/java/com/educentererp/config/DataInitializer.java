package com.educentererp.config;

import com.educentererp.module.classe.Classe;
import com.educentererp.module.classe.ClasseRepository;
import com.educentererp.module.classe.ClasseSchedule;
import com.educentererp.module.finance.Payment;
import com.educentererp.module.finance.PaymentMethod;
import com.educentererp.module.finance.PaymentRepository;
import com.educentererp.module.finance.PaymentStatus;
import com.educentererp.module.student.Student;
import com.educentererp.module.student.StudentRepository;
import com.educentererp.module.student.StudentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ClasseRepository classeRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) {
        if (classeRepository.count() > 0) {
            log.info("Database already contains data — skipping seed.");
            return;
        }

        Classe classe = new Classe();
        classe.setName("Anglais B2 Soir");
        classe.setSubject("Anglais");
        classe.setLevel("B2");
        classe.setSchedule(ClasseSchedule.EVENING);
        classe.setTeacher("Prof. Ahmed");
        classe.setMaxCapacity(15);
        classe.setStartDate(LocalDate.of(2026, 1, 1));
        classe.setEndDate(LocalDate.of(2026, 6, 30));
        classe.setArchived(false);
        classeRepository.save(classe);
        log.info("Seeded Classe: {}", classe.getName());

        Student student = new Student();
        student.setFullName("Karim Idrissi");
        student.setPhone("0661234567");
        student.setEnrollmentDate(LocalDate.of(2026, 3, 28));
        student.setStatus(StudentStatus.ACTIVE);
        student.setClasse(classe);
        studentRepository.save(student);
        log.info("Seeded Student: {}", student.getFullName());

        Payment registrationPayment = new Payment();
        registrationPayment.setStudent(student);
        registrationPayment.setAmountMad(200.0);
        registrationPayment.setDueDate(LocalDate.of(2026, 3, 26));
        registrationPayment.setPaymentDate(LocalDate.of(2026, 3, 26));
        registrationPayment.setMethod(PaymentMethod.CASH);
        registrationPayment.setStatus(PaymentStatus.PAID);
        registrationPayment.setNotes("Frais d'inscription");
        paymentRepository.save(registrationPayment);
        log.info("Seeded Registration Payment: {} MAD", registrationPayment.getAmountMad());

        Payment tuitionPayment = new Payment();
        tuitionPayment.setStudent(student);
        tuitionPayment.setAmountMad(300.0);
        tuitionPayment.setDueDate(LocalDate.of(2026, 4, 26));
        tuitionPayment.setPaymentDate(null);
        tuitionPayment.setMethod(PaymentMethod.CASH);
        tuitionPayment.setStatus(PaymentStatus.PENDING);
        tuitionPayment.setNotes("Mensualité Avril");
        paymentRepository.save(tuitionPayment);
        log.info("Seeded Tuition Payment: {} MAD", tuitionPayment.getAmountMad());

        log.info("Seed completed successfully.");
    }
}
