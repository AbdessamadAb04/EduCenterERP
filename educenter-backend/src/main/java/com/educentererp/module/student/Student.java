package com.educentererp.module.student;

import com.educentererp.module.classe.Classe;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity // tells Spring Boot this class is a database table
@Table (name="students")
@Data // automatically generates getters, setters and constructors
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;
}