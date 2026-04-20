package com.akademi.controller;

import com.akademi.config.security.JwtTokenProvider;
import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.UserSummaryDto;
import com.akademi.enums.Role;
import com.akademi.model.User;
import com.akademi.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    // ── Register (STUDENT or STAFF only — public) ───────────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(
            @Valid @RequestBody RegisterRequest request) {

        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered"));
        }

        // Public registration: only STUDENT and STAFF allowed
        Role assignedRole = Role.STUDENT;
        if (request.getRole() == Role.STAFF) {
            assignedRole = Role.STAFF;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .active(true)
                .build();

        User saved = userService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registered successfully", saved));
    }

    // ── Admin: create a technician account ──────────────────────────────
    @PostMapping("/register/technician")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createTechnician(
            @Valid @RequestBody RegisterRequest request) {

        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.TECHNICIAN)
                .active(true)
                .build();

        User saved = userService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Technician account created", saved));
    }

    // ── Login ────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());

        User user = userService.getUserByEmail(request.getEmail());

        LoginResponse loginResponse = LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    // ── Me (used by OAuth2 redirect) ─────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        User user = userService.getUserByEmail(userDetails.getUsername());

        LoginResponse response = LoginResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(ApiResponse.success("ok", response));
    }

    // ── Admin: list all technician accounts (used for assignment dropdown) ──
    @GetMapping("/users/technicians")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getTechnicians() {
        List<UserSummaryDto> technicians = userService.getUsersByRole(Role.TECHNICIAN)
            .stream()
            .map(u -> new UserSummaryDto(u.getId(), u.getName(), u.getEmail(), u.getRole()))
            .toList();
        return ResponseEntity.ok(new ApiResponse<>(true, "Technicians", technicians));
    }

    // ── Inner classes ────────────────────────────────────────────────────

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank private String password;
        private Role role; // STUDENT (default) or STAFF for public register
    }

    @Getter @Setter
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Getter @Setter @Builder
    public static class LoginResponse {
        private String token;
        private String refreshToken;
        private String email;
        private String name;
        private String role;
    }
}
