package com.educentererp.module.finance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    private String studentName;

    private String phone;

    private String className;

    private Long etablissementId;

    @Column(nullable = false)
    private Double amount;

    private LocalDate dueDate;

    private LocalDate paymentDate;

    private String method;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(length = 2000)
    private String notes;

    private String paymentCategory;

    private LocalDate periodStartDate;

    private LocalDate periodEndDate;

    private Integer daysLate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
        if (paymentCategory == null || paymentCategory.isBlank()) {
            paymentCategory = "TUITION";
        }
        if (daysLate == null) {
            daysLate = 0;
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
