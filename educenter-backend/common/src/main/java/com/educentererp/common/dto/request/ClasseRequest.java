package com.educentererp.common.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;
import java.util.Map;

public record ClasseRequest(
        @NotBlank String name,
        String subject,
        String level,
        String teacher,
        Integer max_capacity,
        String status,
        Double tarif_amount,
        String tarif_period,
        String color,
        @NotBlank String etablissement_id
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "name", name);
        RequestMaps.put(values, "subject", subject);
        RequestMaps.put(values, "level", level);
        RequestMaps.put(values, "teacher", teacher);
        RequestMaps.put(values, "max_capacity", max_capacity);
        RequestMaps.put(values, "status", status);
        RequestMaps.put(values, "tarif_amount", tarif_amount);
        RequestMaps.put(values, "tarif_period", tarif_period);
        RequestMaps.put(values, "color", color);
        RequestMaps.put(values, "etablissement_id", etablissement_id);
        return values;
    }
}
