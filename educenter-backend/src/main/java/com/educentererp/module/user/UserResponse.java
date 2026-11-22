package com.educentererp.module.user;

public record UserResponse(
        String id,
        String email,
        String full_name
) {
}
