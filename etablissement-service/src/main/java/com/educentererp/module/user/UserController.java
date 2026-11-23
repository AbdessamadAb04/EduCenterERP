package com.educentererp.module.user;

import com.educentererp.common.dto.MembershipResponse;
import com.educentererp.common.dto.UserResponse;
import com.educentererp.common.dto.request.UserRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(
            @RequestParam String email,
            @RequestParam(name = "full_name", required = false) String fullName) {
        return userService.findOrCreate(email, fullName);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.get(id);
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody UserRequest body) {
        return userService.create(body.toMap());
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return userService.update(id, body);
    }

    @GetMapping("/{id}/etablissements")
    public List<MembershipResponse> memberships(@PathVariable Long id) {
        return userService.memberships(id);
    }
}
