package com.educentererp.module.finance;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PaymentResponse(
        String id,
        String student_id,
        @JsonProperty("class") String class_name,
        String student,
        String phone,
        Double amount,
        String due_date,
        String payment_date,
        String method,
        String status,
        String notes,
        Integer days_late,
        String payment_category,
        String period_start_date,
        String period_end_date,
        String created_at
) {
}
