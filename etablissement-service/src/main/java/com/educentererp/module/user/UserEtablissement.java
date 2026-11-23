package com.educentererp.module.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_etablissements")
@Getter
@Setter
@NoArgsConstructor
public class UserEtablissement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long etablissementId;

    @Column(length = 20)
    private String role = "OWNER";

    @PrePersist
    protected void onCreate() {
        if (role == null || role.isBlank()) {
            role = "OWNER";
        }
    }
}
