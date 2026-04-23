package com.akademi.controller;

import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.UserSummaryDto;
import com.akademi.enums.Role;
import com.akademi.service.UserService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users", userService.getAllUsers()));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDto>> changeRole(
            @PathVariable Long id,
            @RequestBody RoleChangeRequest request) {

        UserSummaryDto updated = userService.changeRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("Role updated", updated));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDto>> setActive(
            @PathVariable Long id,
            @RequestBody ActiveRequest request) {

        UserSummaryDto updated = userService.setActive(id, request.isActive());
        return ResponseEntity.ok(ApiResponse.success(
                request.isActive() ? "User activated" : "User deactivated", updated));
    }

    @Getter @Setter
    public static class RoleChangeRequest {
        private Role role;
    }

    @Getter @Setter
    public static class ActiveRequest {
        private boolean active;
    }
}