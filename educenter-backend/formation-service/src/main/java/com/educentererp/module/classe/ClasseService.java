package com.educentererp.module.classe;

import com.educentererp.common.JsonValues;
import com.educentererp.common.dto.ClassResponse;
import com.educentererp.module.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ClasseService {

    private final ClasseRepository classeRepository;
    private final StudentRepository studentRepository;

    public List<ClassResponse> list(Long etablissementId) {
        List<Classe> classes = etablissementId == null
                ? classeRepository.findAll()
                : classeRepository.findByEtablissementId(etablissementId);
        return classes.stream().map(ClasseService::toResponse).toList();
    }

    public ClassResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public Classe getEntity(Long id) {
        return classeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Classe introuvable: " + id));
    }

    public ClassResponse create(Map<String, Object> body) {
        Classe classe = new Classe();
        apply(classe, body);
        return toResponse(classeRepository.save(classe));
    }

    public ClassResponse update(Long id, Map<String, Object> body) {
        Classe classe = getEntity(id);
        apply(classe, body);
        return toResponse(classeRepository.save(classe));
    }

    public void delete(Long id) {
        if (studentRepository.countByClasseId(id) > 0) {
            throw new IllegalArgumentException(
                    "Impossible de supprimer cette classe : elle contient encore des étudiants.");
        }
        classeRepository.deleteById(id);
    }

    private void apply(Classe classe, Map<String, Object> body) {
        if (JsonValues.has(body, "name")) {
            classe.setName(JsonValues.string(body, "name"));
        }
        if (JsonValues.has(body, "subject")) {
            classe.setSubject(JsonValues.string(body, "subject"));
        }
        if (JsonValues.has(body, "level")) {
            classe.setLevel(JsonValues.string(body, "level"));
        }
        if (JsonValues.has(body, "teacher")) {
            classe.setTeacher(JsonValues.string(body, "teacher"));
        }
        if (JsonValues.has(body, "max_capacity")) {
            classe.setMaxCapacity(JsonValues.integer(body, "max_capacity"));
        }
        if (JsonValues.has(body, "status")) {
            classe.setStatus(JsonValues.string(body, "status"));
        }
        if (JsonValues.has(body, "tarif_amount")) {
            classe.setTarifAmount(JsonValues.number(body, "tarif_amount"));
        }
        if (JsonValues.has(body, "tarif_period")) {
            classe.setTarifPeriod(JsonValues.string(body, "tarif_period"));
        }
        if (JsonValues.has(body, "color")) {
            classe.setColor(JsonValues.string(body, "color"));
        }
        if (JsonValues.has(body, "etablissement_id")) {
            classe.setEtablissementId(JsonValues.id(body, "etablissement_id"));
        }
    }

    public static ClassResponse toResponse(Classe classe) {
        return new ClassResponse(
                JsonValues.idString(classe.getId()),
                classe.getName(),
                classe.getSubject(),
                classe.getLevel(),
                classe.getTeacher(),
                classe.getMaxCapacity(),
                classe.getStatus(),
                classe.getTarifAmount() == null ? 0.0 : classe.getTarifAmount(),
                classe.getTarifPeriod(),
                classe.getColor(),
                JsonValues.idString(classe.getEtablissementId()),
                classe.getCreatedAt() == null ? null : classe.getCreatedAt().toString(),
                classe.getUpdatedAt() == null ? null : classe.getUpdatedAt().toString()
        );
    }
}
