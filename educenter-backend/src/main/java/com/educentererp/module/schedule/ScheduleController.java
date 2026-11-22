package com.educentererp.module.schedule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<ScheduleResponse> list(
            @RequestParam(name = "class_id", required = false) Long classId,
            @RequestParam(name = "etablissement_id", required = false) Long etablissementId) {
        if (classId != null) {
            return scheduleService.listByClass(classId);
        }
        if (etablissementId != null) {
            return scheduleService.listByEtablissement(etablissementId);
        }
        return List.of();
    }

    @GetMapping("/{id}")
    public ScheduleResponse get(@PathVariable Long id) {
        return scheduleService.get(id);
    }

    @PostMapping
    public ScheduleResponse create(@RequestBody Map<String, Object> body) {
        return scheduleService.create(body);
    }

    @PostMapping("/classes/{classId}")
    public void createForClass(@PathVariable Long classId, @RequestBody List<Map<String, Object>> sessions) {
        scheduleService.createForClass(classId, sessions);
    }

    @PutMapping("/classes/{classId}/replace-active")
    public void replaceActiveForClass(@PathVariable Long classId, @RequestBody List<Map<String, Object>> sessions) {
        scheduleService.replaceActiveForClass(classId, sessions);
    }

    @PutMapping("/{id}")
    public ScheduleResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return scheduleService.update(id, body);
    }

    @PutMapping("/{id}/archive")
    public ScheduleResponse archive(@PathVariable Long id) {
        return scheduleService.archive(id);
    }

    @PutMapping("/{id}/restore")
    public ScheduleResponse restore(@PathVariable Long id) {
        return scheduleService.restore(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/classes/{classId}")
    public ResponseEntity<Void> deleteByClass(@PathVariable Long classId) {
        scheduleService.deleteByClass(classId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/archived")
    public ResponseEntity<Void> deleteArchived(
            @RequestParam(name = "etablissement_id", required = false) Long etablissementId) {
        if (etablissementId != null) {
            scheduleService.deleteArchivedByEtablissement(etablissementId);
        }
        return ResponseEntity.noContent().build();
    }
}
