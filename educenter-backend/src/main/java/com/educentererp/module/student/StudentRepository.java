package com.educentererp.module.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByStatus(StudentStatus status);

    List<Student> findByClasseId(Long classeId);

    long countByStatus(StudentStatus status);

    List<Student> findTop5ByOrderByEnrollmentDateDesc();
}
