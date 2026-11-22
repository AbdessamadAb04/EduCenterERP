package com.educentererp.common.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;
import java.util.Map;

public record PaymentRequest(
        @NotBlank String student_id,
        @NotNull Double amount,
        @NotBlank String due_date,
        @NotBlank String method,
        String payment_category,
        String payment_date,
        String status,
        String period_start_date,
        String period_end_date,
        String notes
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "student_id", student_id);
        RequestMaps.put(values, "amount", amount);
        RequestMaps.put(values, "due_date", due_date);
        RequestMaps.put(values, "method", method);
        RequestMaps.put(values, "payment_category", payment_category);
        RequestMaps.put(values, "payment_date", payment_date);
        RequestMaps.put(values, "status", status);
        RequestMaps.put(values, "period_start_date", period_start_date);
        RequestMaps.put(values, "period_end_date", period_end_date);
        RequestMaps.put(values, "notes", notes);
        return values;
    }
}
