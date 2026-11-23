package com.educentererp.module.classe;

import com.educentererp.common.dto.ClassResponse;
import com.educentererp.common.dto.request.ClasseRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClasseController {

    private final ClasseService classeService;

    @GetMapping
    public List<ClassResponse> list(@RequestParam(name = "etablissement_id", required = false) Long etablissementId) {
        return classeService.list(etablissementId);
    }

    @GetMapping("/{id}")
    public ClassResponse get(@PathVariable Long id) {
        return classeService.get(id);
    }

    @PostMapping
    public ClassResponse create(@Valid @RequestBody ClasseRequest body,
                                @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        return classeService.create(body.toMap(), idempotencyKey);
    }

    @PutMapping("/{id}")
    public ClassResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return classeService.update(id, body);
    }

    @PutMapping("/{id}/archive")
    public ClassResponse archive(@PathVariable Long id) {
        return classeService.update(id, Map.of("status", "ARCHIVED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
