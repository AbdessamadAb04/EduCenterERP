package com.educentererp.module.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ScheduleSessionRepository extends JpaRepository<ScheduleSession, Long> {

    List<ScheduleSession> findByClasseId(Long classeId);

    List<ScheduleSession> findByClasseEtablissementId(Long etablissementId);

    List<ScheduleSession> findByClasseEtablissementIdAndStatus(Long etablissementId, String status);

    void deleteByClasseId(Long classeId);

    void deleteByIdIn(Collection<Long> ids);
}
