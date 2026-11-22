package com.educentererp.common.dto;

public record StudentResponse(
        String id,
        String full_name,
        String phone,
        String classe_id,
        String enrollment_date,
        String status,
        Double tuition_fee,
        String tuition_fee_status,
        Double registration_fee,
        String registration_fee_paid,
        String notes,
        String email,
        String created_at,
        String class_name,
        String etablissement_id
) {
}
