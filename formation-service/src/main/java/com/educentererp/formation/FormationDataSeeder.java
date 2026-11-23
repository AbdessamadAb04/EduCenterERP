package com.educentererp.formation;

import com.educentererp.module.classe.Classe;
import com.educentererp.module.classe.ClasseRepository;
import com.educentererp.module.schedule.ScheduleSession;
import com.educentererp.module.schedule.ScheduleSessionRepository;
import com.educentererp.module.student.Student;
import com.educentererp.module.student.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@ConditionalOnProperty(name = "seed.enabled", havingValue = "true", matchIfMissing = true)
public class FormationDataSeeder implements CommandLineRunner {

    private final ClasseRepository classeRepository;
    private final ScheduleSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final Long etablissementId;

    public FormationDataSeeder(ClasseRepository classeRepository,
                               ScheduleSessionRepository sessionRepository,
                               StudentRepository studentRepository,
                               @Value("${seed.etablissement-id:1}") Long etablissementId) {
        this.classeRepository = classeRepository;
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
        this.etablissementId = etablissementId;
    }

    @Override
    public void run(String... args) {
        if (classeRepository.count() > 0) {
            return;
        }

        Classe french = createClasse("Français - FLE Débutant", "Français", "A1-A2", "Amina El Idrissi",
                12, 500.0, "mensuel", "#3B82F6");
        Classe english = createClasse("Anglais - Business", "Anglais", "B2", "Karim Bennani",
                10, 700.0, "mensuel", "#10B981");

        createSession(french, 1, "18:00", "19:30");
        createSession(french, 3, "18:00", "19:30");
        createSession(english, 2, "19:00", "20:30");

        createStudent("Amine Berrada", "0661122334", french, LocalDate.now().minusMonths(3), 500.0, "PAID", 200.0, "PAID");
        createStudent("Kenza Tazi", "0662233445", french, LocalDate.now().minusMonths(2), 500.0, "PENDING", 200.0, "PAID");
        createStudent("Youssef Alami", "0665566778", english, LocalDate.now().minusMonths(4), 700.0, "PAID", 200.0, "PAID");
    }

    private Classe createClasse(String name, String subject, String level, String teacher,
                                Integer capacity, Double tarif, String period, String color) {
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

    private void createStudent(String name, String phone, Classe classe, LocalDate enrollment,
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
        studentRepository.save(student);
    }
}
