package com.educentererp.common.dto;

public record ScheduleResponse(
        String id,
        String class_id,
        Integer day,
        String start_time,
        String end_time,
        String duration,
        String status,
        String created_at,
        String updated_at,
        ScheduleClassInfo classes
) {
}
