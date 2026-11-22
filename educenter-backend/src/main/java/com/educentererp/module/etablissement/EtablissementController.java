package com.educentererp.module.etablissement;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/etablissements")
@RequiredArgsConstructor
public class EtablissementController {

    private final EtablissementService etablissementService;

    @GetMapping
    public List<EtablissementResponse> list() {
        return etablissementService.list();
    }

    @GetMapping("/{id}")
    public EtablissementResponse get(@PathVariable Long id) {
        return etablissementService.get(id);
    }

    @PostMapping
    public EtablissementResponse create(@RequestBody Map<String, Object> body) {
        return etablissementService.create(body);
    }

    @PutMapping("/{id}")
    public EtablissementResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return etablissementService.update(id, body);
    }
}
