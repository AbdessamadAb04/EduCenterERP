package com.educentererp.module.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStudentId(Long studentId);

    long countByStudentId(Long studentId);

    List<Payment> findByEtablissementId(Long etablissementId);

    List<Payment> findByStatus(String status);

    long countByStatus(String status);
}
