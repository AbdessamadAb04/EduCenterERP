package com.educentererp.module.student;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student updatedStudent) {
        Student existing = getStudentById(id);
        existing.setFullName(updatedStudent.getFullName());
        existing.setPhone(updatedStudent.getPhone());
        existing.setEnrollmentDate(updatedStudent.getEnrollmentDate());
        existing.setStatus(updatedStudent.getStatus());
        existing.setClasse(updatedStudent.getClasse());
        return studentRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public List<Student> getStudentsByStatus(StudentStatus status) {
        return studentRepository.findByStatus(status);
    }

    public List<Student> getStudentsByClasse(Long classeId) {
        return studentRepository.findByClasseId(classeId);
    }
}