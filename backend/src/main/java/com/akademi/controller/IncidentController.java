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

    // Any logged-in user can report an incident
    @PostMapping
    public ResponseEntity<ApiResponse<Incident>> createIncident(
            @Valid @RequestBody IncidentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Incident incident = incidentService.createIncident(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Incident reported successfully", incident));
    }

    // Any logged-in user can see their own incidents
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Incident>>> getMyIncidents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(incidentService.getUserIncidents(user.getId())));
    }

    // Technician: get incidents assigned to them
    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Incident>>> getAssignedIncidents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                incidentService.getAssignedIncidents(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Incident>> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentById(id)));
    }

    // Admin: view all incidents
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Incident>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getAllIncidents()));
    }

    // Admin or Technician (if assigned): update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<Incident>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                incidentService.updateStatus(id, status, user)));
    }

    // Admin or Technician: add a resolution note
    @PatchMapping("/{id}/resolution")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<Incident>> addResolutionNote(
            @PathVariable Long id,
            @RequestBody ResolutionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resolution note added",
                incidentService.addResolutionNote(id, request.getNote(), user)));
    }

    // Admin only: assign a technician to an incident
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Incident>> assignIncident(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Incident assigned",
                incidentService.assignIncident(id, userId)));
    }

    // ── Inner class ──────────────────────────────────────────────────────
    @lombok.Getter @lombok.Setter
    public static class ResolutionRequest {
        private String note;
    }
}
