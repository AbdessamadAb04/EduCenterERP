package com.educentererp.config;

import com.educentererp.module.classe.Classe;
import com.educentererp.module.classe.ClasseRepository;
import com.educentererp.module.etablissement.Etablissement;
import com.educentererp.module.etablissement.EtablissementRepository;
import com.educentererp.module.finance.Payment;
import com.educentererp.module.finance.PaymentRepository;
import com.educentererp.module.schedule.ScheduleSession;
import com.educentererp.module.schedule.ScheduleSessionRepository;
import com.educentererp.module.student.Student;
import com.educentererp.module.student.StudentRepository;
import com.educentererp.module.user.AppUser;
import com.educentererp.module.user.UserEtablissement;
import com.educentererp.module.user.UserEtablissementRepository;
import com.educentererp.module.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EtablissementRepository etablissementRepository;
    private final UserRepository userRepository;
    private final UserEtablissementRepository membershipRepository;
    private final ClasseRepository classeRepository;
    private final ScheduleSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) {
        if (etablissementRepository.count() > 0) {
            log.info("Database already contains data — skipping seed.");
            return;
        }

        AppUser owner = new AppUser();
        owner.setEmail("demo@educenter.local");
        owner.setFullName("Demo Owner");
        owner = userRepository.save(owner);

        Etablissement etablissement = new Etablissement();
        etablissement.setCenterName("Casablanca Language & Training Center");
        etablissement.setCenterType("langues");
        etablissement.setCity("Casablanca");
        etablissement.setAddress("12 Rue des Écoles, Casablanca");
        etablissement.setPhone("0660000000");
        etablissement.setEmail("contact@educenter.local");
        etablissement.setRegistrationFee(200.0);
        etablissement.setOwnerUserId(owner.getId());
        etablissement = etablissementRepository.save(etablissement);

        UserEtablissement membership = new UserEtablissement();
        membership.setUserId(owner.getId());
        membership.setEtablissementId(etablissement.getId());
        membership.setRole("OWNER");
        membershipRepository.save(membership);

        Classe french = createClasse("Français - FLE Débutant", "Français", "A1-A2", "Amina El Idrissi",
                12, 500.0, "mensuel", "#3B82F6", etablissement.getId());
        Classe english = createClasse("Anglais - Business", "Anglais", "B2", "Karim Bennani",
                10, 700.0, "mensuel", "#10B981", etablissement.getId());

        createSession(french, 1, "18:00", "19:30");
        createSession(french, 3, "18:00", "19:30");
        createSession(english, 2, "19:00", "20:30");

        Student amine = createStudent("Amine Berrada", "0661122334", french,
                LocalDate.now().minusMonths(3), 500.0, "PAID", 200.0, "PAID");
        Student kenza = createStudent("Kenza Tazi", "0662233445", french,
                LocalDate.now().minusMonths(2), 500.0, "PENDING", 200.0, "PAID");
        Student youssef = createStudent("Youssef Alami", "0665566778", english,
                LocalDate.now().minusMonths(4), 700.0, "PAID", 200.0, "PAID");

        createPayment(amine, 200.0, "REGISTRATION", LocalDate.now().minusMonths(3),
                LocalDate.now().minusMonths(3), "Espèces", "PAID", "Frais d'inscription");
        createPayment(amine, 500.0, "TUITION", LocalDate.now().plusDays(10),
                null, "Virement", "PENDING", null);
        createPayment(kenza, 500.0, "TUITION", LocalDate.now().minusDays(10),
                null, "Autre", "OVERDUE", "Retard mensualité");
        createPayment(youssef, 700.0, "TUITION", LocalDate.now().minusDays(5),
                LocalDate.now().minusDays(6), "CIH", "PAID", null);

        log.info("Seed completed successfully.");
    }

    private Classe createClasse(String name, String subject, String level, String teacher,
                                Integer capacity, Double tarif, String period, String color, Long etablissementId) {
        Classe classe = new Classe();
        classe.setName(name);
        classe.setSubject(subject);
        classe.setLevel(level);
        classe.setTeacher(teacher);
        classe.setMaxCapacity(capacity);
        classe.setTarifAmount(tarif);
        classe.setTarifPeriod(period);
        classe.setColor(color);
        classe.setStatus("ACTIVE");
        classe.setEtablissementId(etablissementId);
        return classeRepository.save(classe);
    }

    private void createSession(Classe classe, int day, String start, String end) {
        ScheduleSession session = new ScheduleSession();
        session.setClasse(classe);
        session.setDay(day);
        session.setStartTime(start);
        session.setEndTime(end);
        session.setDuration("PT1H30M");
        session.setStatus("ACTIVE");
        sessionRepository.save(session);
    }

    private Student createStudent(String name, String phone, Classe classe, LocalDate enrollment,
                                  Double tuition, String tuitionStatus, Double registration, String registrationStatus) {
        Student student = new Student();
        student.setFullName(name);
        student.setPhone(phone);
        student.setClasse(classe);
        student.setEnrollmentDate(enrollment);
        student.setStatus("ACTIVE");
        student.setTuitionFee(tuition);
        student.setTuitionFeeStatus(tuitionStatus);
        student.setRegistrationFee(registration);
        student.setRegistrationFeePaid(registrationStatus);
        return studentRepository.save(student);
    }

    private void createPayment(Student student, Double amount, String category, LocalDate dueDate,
                               LocalDate paymentDate, String method, String status, String notes) {
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(amount);
        payment.setPaymentCategory(category);
        payment.setDueDate(dueDate);
        payment.setPaymentDate(paymentDate);
        payment.setMethod(method);
        payment.setStatus(status);
        payment.setNotes(notes);
        long daysLate = paymentDate == null && dueDate.isBefore(LocalDate.now())
                ? java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now())
                : 0;
        payment.setDaysLate((int) daysLate);
        paymentRepository.save(payment);
    }
}
