package com.educentererp.common.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;
import java.util.Map;

public record StudentRequest(
        @NotBlank String full_name,
        String phone,
        @NotBlank String classe_id,
        @NotBlank String enrollment_date,
        @NotNull Double tuition_fee,
        String tuition_fee_status,
        @NotNull Double registration_fee,
        String registration_fee_paid,
        String status,
        String notes,
        @Email String email
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "full_name", full_name);
        RequestMaps.put(values, "phone", phone);
        RequestMaps.put(values, "classe_id", classe_id);
        RequestMaps.put(values, "enrollment_date", enrollment_date);
        RequestMaps.put(values, "tuition_fee", tuition_fee);
        RequestMaps.put(values, "tuition_fee_status", tuition_fee_status);
        RequestMaps.put(values, "registration_fee", registration_fee);
        RequestMaps.put(values, "registration_fee_paid", registration_fee_paid);
        RequestMaps.put(values, "status", status);
        RequestMaps.put(values, "notes", notes);
        RequestMaps.put(values, "email", email);
        return values;
    }
}
