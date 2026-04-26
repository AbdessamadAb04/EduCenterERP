package com.educentererp.module.classe;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity // tells Spring Boot this class is a database table
@Table (name="classe")
@Data // automatically generates getters, setters and constructors
public class Classe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column
    private String level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClasseSchedule schedule;

    @Column(nullable = false)
    private String teacher;

    @Column
    private Integer maxCapacity;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Boolean archived = false;
}