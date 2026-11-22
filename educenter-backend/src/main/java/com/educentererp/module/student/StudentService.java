package com.educentererp.module.student;

import com.educentererp.common.JsonValues;
import com.educentererp.module.classe.Classe;
import com.educentererp.module.classe.ClasseRepository;
import com.educentererp.module.finance.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClasseRepository classeRepository;
    private final PaymentRepository paymentRepository;

    public List<StudentResponse> list(Long etablissementId) {
        List<Student> students = etablissementId == null
                ? studentRepository.findAll()
                : studentRepository.findByClasseEtablissementId(etablissementId);
        return students.stream().map(StudentService::toResponse).toList();
    }

    public StudentResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public Student getEntity(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Étudiant introuvable: " + id));
    }

    public StudentResponse create(Map<String, Object> body) {
        Student student = new Student();
        apply(student, body);
        return toResponse(studentRepository.save(student));
    }

    public StudentResponse update(Long id, Map<String, Object> body) {
        Student student = getEntity(id);
        apply(student, body);
        return toResponse(studentRepository.save(student));
    }

    public void delete(Long id) {
        if (paymentRepository.countByStudentId(id) > 0) {
            throw new IllegalArgumentException(
                    "Impossible de supprimer cet étudiant : des paiements lui sont associés. Utilisez l'archivage à la place.");
        }
        studentRepository.deleteById(id);
    }

    public StudentResponse softDelete(Long id) {
        return update(id, Map.of("status", "DROPPED"));
    }

    private void apply(Student student, Map<String, Object> body) {
        if (JsonValues.has(body, "full_name")) {
            student.setFullName(JsonValues.string(body, "full_name"));
        }
        if (JsonValues.has(body, "phone")) {
            student.setPhone(JsonValues.string(body, "phone"));
        }
        if (JsonValues.has(body, "email")) {
            student.setEmail(JsonValues.string(body, "email"));
        }
        if (JsonValues.has(body, "notes")) {
            student.setNotes(JsonValues.string(body, "notes"));
        }
        if (JsonValues.has(body, "enrollment_date")) {
            student.setEnrollmentDate(JsonValues.date(body, "enrollment_date"));
        }
        if (JsonValues.has(body, "status")) {
            student.setStatus(JsonValues.string(body, "status"));
        }
        if (JsonValues.has(body, "tuition_fee")) {
            student.setTuitionFee(JsonValues.number(body, "tuition_fee"));
        }
        if (JsonValues.has(body, "tuition_fee_status")) {
            student.setTuitionFeeStatus(JsonValues.string(body, "tuition_fee_status"));
        }
        if (JsonValues.has(body, "registration_fee")) {
            student.setRegistrationFee(JsonValues.number(body, "registration_fee"));
        }
        if (JsonValues.has(body, "registration_fee_paid")) {
            student.setRegistrationFeePaid(JsonValues.string(body, "registration_fee_paid"));
        }
        if (JsonValues.has(body, "classe_id")) {
            Long classeId = JsonValues.id(body, "classe_id");
            Classe classe = classeId == null ? null : classeRepository.findById(classeId)
                    .orElseThrow(() -> new NoSuchElementException("Classe introuvable: " + classeId));
            student.setClasse(classe);
        }
    }

    public static StudentResponse toResponse(Student student) {
        String className = student.getClasse() == null ? "" : student.getClasse().getName();
        return new StudentResponse(
                JsonValues.idString(student.getId()),
                student.getFullName(),
                student.getPhone(),
                student.getClasse() == null ? null : JsonValues.idString(student.getClasse().getId()),
                JsonValues.dateString(student.getEnrollmentDate()),
                student.getStatus(),
                student.getTuitionFee() == null ? 0.0 : student.getTuitionFee(),
                student.getTuitionFeeStatus(),
                student.getRegistrationFee() == null ? 0.0 : student.getRegistrationFee(),
                student.getRegistrationFeePaid(),
                student.getNotes(),
                student.getEmail(),
                student.getCreatedAt() == null ? null : student.getCreatedAt().toString(),
                className == null ? "" : className
        );
    }
}
