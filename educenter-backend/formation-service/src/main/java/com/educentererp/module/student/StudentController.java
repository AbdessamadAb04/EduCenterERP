package com.educentererp.module.student;

import com.educentererp.common.dto.StudentResponse;
import com.educentererp.common.dto.request.StudentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public List<StudentResponse> list(@RequestParam(name = "etablissement_id", required = false) Long etablissementId) {
        return studentService.list(etablissementId);
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) {
        return studentService.get(id);
    }

    @PostMapping
    public StudentResponse create(@Valid @RequestBody StudentRequest body) {
        return studentService.create(body.toMap());
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return studentService.update(id, body);
    }

    @PutMapping("/{id}/archive")
    public StudentResponse archive(@PathVariable Long id) {
        return studentService.softDelete(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classe/{classeId}")
    public List<StudentResponse> byClasse(@PathVariable Long classeId) {
        return studentService.list(null).stream()
                .filter(student -> String.valueOf(classeId).equals(student.classe_id()))
                .toList();
    }
}
