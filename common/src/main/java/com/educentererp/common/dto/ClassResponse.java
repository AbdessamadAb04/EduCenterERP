package com.educentererp.common.dto;

public record ClassResponse(
        String id,
        String name,
        String subject,
        String level,
        String teacher,
        Integer max_capacity,
        String status,
        Double tarif_amount,
        String tarif_period,
        String color,
        String etablissement_id,
        String created_at,
        String updated_at
) {
}
