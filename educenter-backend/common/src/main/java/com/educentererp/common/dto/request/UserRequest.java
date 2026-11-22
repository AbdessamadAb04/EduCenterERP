package com.educentererp.common.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.LinkedHashMap;
import java.util.Map;

public record UserRequest(
        @NotBlank @Email String email,
        String full_name
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "email", email);
        RequestMaps.put(values, "full_name", full_name);
        return values;
    }
}
