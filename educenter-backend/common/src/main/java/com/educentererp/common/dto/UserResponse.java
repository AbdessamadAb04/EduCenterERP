package com.educentererp.common.dto;

public record UserResponse(
        String id,
        String email,
        String full_name
) {
}
