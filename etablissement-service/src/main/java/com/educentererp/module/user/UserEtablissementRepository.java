package com.educentererp.module.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserEtablissementRepository extends JpaRepository<UserEtablissement, Long> {

    List<UserEtablissement> findByUserId(Long userId);

    Optional<UserEtablissement> findByUserIdAndEtablissementId(Long userId, Long etablissementId);
}
