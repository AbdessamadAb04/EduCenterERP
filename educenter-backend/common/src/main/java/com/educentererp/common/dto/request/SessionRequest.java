package com.educentererp.common.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;
import java.util.Map;

public record SessionRequest(
        String class_id,
        @NotNull @Min(1) @Max(7) Integer day,
        @NotBlank String start_time,
        @NotBlank String end_time,
        String duration,
        String status
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "class_id", class_id);
        RequestMaps.put(values, "day", day);
        RequestMaps.put(values, "start_time", start_time);
        RequestMaps.put(values, "end_time", end_time);
        RequestMaps.put(values, "duration", duration);
        RequestMaps.put(values, "status", status);
        return values;
    }
}
