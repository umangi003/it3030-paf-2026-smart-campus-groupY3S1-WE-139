package com.akademi.controller;

import com.akademi.dto.request.IncidentRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.enums.TicketStatus;
import com.akademi.model.Incident;
import com.akademi.model.User;
import com.akademi.service.IncidentService;
import com.akademi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<Incident>> createIncident(
            @Valid @RequestBody IncidentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Incident incident = incidentService.createIncident(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Incident reported successfully", incident));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Incident>>> getMyIncidents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(incidentService.getUserIncidents(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Incident>> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentById(id)));
    }

    // Admin only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Incident>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getAllIncidents()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Incident>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                incidentService.updateStatus(id, status, user)));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Incident>> assignIncident(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Incident assigned",
                incidentService.assignIncident(id, userId)));
    }
}
