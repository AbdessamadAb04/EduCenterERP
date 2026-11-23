package com.educentererp.module.student;

import com.educentererp.module.classe.Classe;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    private LocalDate enrollmentDate;

    @Column(length = 20)
    private String status = "ACTIVE";

    private Double tuitionFee;

    private String tuitionFeeStatus;

    private Double registrationFee;

    private String registrationFeePaid;

    @Column(length = 2000)
    private String notes;

    private String email;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        if (tuitionFeeStatus == null || tuitionFeeStatus.isBlank()) {
            tuitionFeeStatus = "PENDING";
        }
        if (registrationFeePaid == null || registrationFeePaid.isBlank()) {
            registrationFeePaid = "PENDING";
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
