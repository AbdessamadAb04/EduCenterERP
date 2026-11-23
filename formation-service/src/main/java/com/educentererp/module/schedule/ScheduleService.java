package com.educentererp.module.schedule;

import com.educentererp.common.JsonValues;
import com.educentererp.common.dto.ScheduleClassInfo;
import com.educentererp.common.dto.ScheduleResponse;
import com.educentererp.module.classe.Classe;
import com.educentererp.module.classe.ClasseRepository;
import com.educentererp.module.idempotency.IdempotencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleSessionRepository sessionRepository;
    private final ClasseRepository classeRepository;
    private final IdempotencyService idempotencyService;

    public List<ScheduleResponse> listByClass(Long classId) {
        return sessionRepository.findByClasseId(classId).stream()
                .map(ScheduleService::toResponse)
                .toList();
    }

    public List<ScheduleResponse> listByEtablissement(Long etablissementId) {
        return sessionRepository.findByClasseEtablissementId(etablissementId).stream()
                .map(ScheduleService::toResponse)
                .toList();
    }

    public ScheduleResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public ScheduleResponse create(Map<String, Object> body, String idempotencyKey) {
        return idempotencyService.replay(idempotencyKey, body, ScheduleResponse.class)
                .orElseGet(() -> {
                    ScheduleSession session = new ScheduleSession();
                    apply(session, body);
                    ScheduleResponse response = toResponse(sessionRepository.save(session));
                    idempotencyService.store(idempotencyKey, body, response);
                    return response;
                });
    }

    public void createForClass(Long classId, List<Map<String, Object>> sessions, String idempotencyKey) {
        if (sessions == null) {
            return;
        }
        if (idempotencyService.replay(idempotencyKey, sessions, String.class).isPresent()) {
            return;
        }
        sessions.forEach(session -> {
            Map<String, Object> values = new java.util.HashMap<>(session);
            values.put("class_id", String.valueOf(classId));
            create(values, null);
        });
        idempotencyService.store(idempotencyKey, sessions, "OK");
    }

    public void replaceActiveForClass(Long classId, List<Map<String, Object>> sessions) {
        List<ScheduleSession> active = sessionRepository.findByClasseId(classId).stream()
                .filter(session -> !"ARCHIVED".equals(session.getStatus()))
                .toList();
        if (!active.isEmpty()) {
            sessionRepository.deleteAll(active);
        }
        createForClass(classId, sessions, null);
    }

    public ScheduleResponse update(Long id, Map<String, Object> body) {
        ScheduleSession session = getEntity(id);
        apply(session, body);
        if (JsonValues.has(body, "start_time") || JsonValues.has(body, "end_time")) {
            session.setDuration(duration(session.getStartTime(), session.getEndTime()));
        }
        return toResponse(sessionRepository.save(session));
    }

    public void delete(Long id) {
        sessionRepository.deleteById(id);
    }

    public void deleteByClass(Long classId) {
        sessionRepository.deleteByClasseId(classId);
    }

    public ScheduleResponse archive(Long id) {
        return update(id, Map.of("status", "ARCHIVED"));
    }

    public ScheduleResponse restore(Long id) {
        return update(id, Map.of("status", "ACTIVE"));
    }

    public void deleteArchivedByEtablissement(Long etablissementId) {
        sessionRepository.findByClasseEtablissementIdAndStatus(etablissementId, "ARCHIVED")
                .forEach(sessionRepository::delete);
    }

    private ScheduleSession getEntity(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Séance introuvable: " + id));
    }

    private void apply(ScheduleSession session, Map<String, Object> body) {
        if (JsonValues.has(body, "class_id")) {
            Long classId = JsonValues.id(body, "class_id");
            if (classId == null) {
                throw new IllegalArgumentException("Classe requise");
            }
            Classe classe = classeRepository.findById(classId)
                    .orElseThrow(() -> new NoSuchElementException("Classe introuvable: " + classId));
            session.setClasse(classe);
        }
        if (JsonValues.has(body, "day")) {
            session.setDay(JsonValues.integer(body, "day"));
        }
        if (JsonValues.has(body, "start_time")) {
            session.setStartTime(JsonValues.string(body, "start_time"));
        }
        if (JsonValues.has(body, "end_time")) {
            session.setEndTime(JsonValues.string(body, "end_time"));
        }
        if (JsonValues.has(body, "duration")) {
            session.setDuration(JsonValues.string(body, "duration"));
        }
        if (JsonValues.has(body, "status")) {
            session.setStatus(JsonValues.string(body, "status"));
        }
        if (session.getDuration() == null && session.getStartTime() != null && session.getEndTime() != null) {
            session.setDuration(duration(session.getStartTime(), session.getEndTime()));
        }
    }

    private static String duration(String start, String end) {
        if (start == null || end == null) {
            return null;
        }
        int from = minutes(start);
        int to = minutes(end);
        if (to == 0) {
            to = 24 * 60;
        } else if (to < from) {
            to += 24 * 60;
        }
        int total = Math.max(0, to - from);
        int hours = total / 60;
        int mins = total % 60;
        String result = "PT";
        if (hours > 0) {
            result += hours + "H";
        }
        if (mins > 0) {
            result += mins + "M";
        }
        return result.equals("PT") ? "PT0M" : result;
    }

    private static int minutes(String time) {
        String[] parts = time.split(":");
        int hours = Integer.parseInt(parts[0]);
        int mins = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        return hours * 60 + mins;
    }

    public static ScheduleResponse toResponse(ScheduleSession session) {
        Classe classe = session.getClasse();
        ScheduleClassInfo info = classe == null ? null : new ScheduleClassInfo(
                classe.getName(),
                classe.getSubject(),
                classe.getTeacher(),
                classe.getColor()
        );
        return new ScheduleResponse(
                JsonValues.idString(session.getId()),
                classe == null ? null : JsonValues.idString(classe.getId()),
                session.getDay(),
                session.getStartTime(),
                session.getEndTime(),
                session.getDuration(),
                session.getStatus(),
                session.getCreatedAt() == null ? null : session.getCreatedAt().toString(),
                session.getUpdatedAt() == null ? null : session.getUpdatedAt().toString(),
                info
        );
    }
}
