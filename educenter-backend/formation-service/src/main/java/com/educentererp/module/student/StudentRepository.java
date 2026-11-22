package com.educentererp.module.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByClasseId(Long classeId);

    long countByClasseId(Long classeId);

    List<Student> findByClasseEtablissementId(Long etablissementId);

    long countByClasseEtablissementIdAndStatus(Long etablissementId, String status);

    List<Student> findTop5ByOrderByEnrollmentDateDesc();
}
