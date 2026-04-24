package com.akademi.controller;

import com.akademi.dto.request.IncidentRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.IncidentResponse;
import com.akademi.enums.TicketStatus;
import com.akademi.model.Incident;
import com.akademi.model.User;
import com.akademi.service.IncidentService;
import com.akademi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    // Any logged-in user can upload images to their own incident (max 3)
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<String>>> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        if (files.size() > 3) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Maximum 3 images allowed"));
        }

        List<String> allowedTypes = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
        for (MultipartFile file : files) {
            if (!allowedTypes.contains(file.getContentType())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only image files are allowed (JPG, PNG, WEBP, GIF)"));
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Each image must be under 5MB"));
            }
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get("uploads/" + filename);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            urls.add("/uploads/" + filename);
        }

        incidentService.addImageUrls(id, urls);
        return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", urls));
    }

    // Any logged-in user can see their own incidents
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getMyIncidents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<IncidentResponse> result = incidentService.getUserIncidents(user.getId())
                .stream().map(incidentService::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Technician: get incidents assigned to them
    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getAssignedIncidents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<IncidentResponse> result = incidentService.getAssignedIncidents(user.getId())
                .stream().map(incidentService::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Any logged-in user can view a specific incident
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                incidentService.toResponse(incidentService.getIncidentById(id))));
    }

    // Admin: view all incidents
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getAllIncidents() {
        List<IncidentResponse> result = incidentService.getAllIncidents()
                .stream().map(incidentService::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Admin or Technician: update status
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

    // Admin only: reject an incident with a reason
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Incident>> rejectIncident(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Incident rejected",
                incidentService.rejectIncident(id, reason)));
    }

    // Student or Admin: delete incident
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Incident incident = incidentService.getIncidentById(id);

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            if (incident.getStatus() != TicketStatus.CLOSED && incident.getStatus() != TicketStatus.REJECTED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Admins can only delete CLOSED or REJECTED incidents"));
            }
        } else {
            if (!incident.getReportedBy().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only delete your own incidents"));
            }
            if (incident.getStatus() != TicketStatus.OPEN && incident.getStatus() != TicketStatus.REJECTED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only delete OPEN or REJECTED incidents"));
            }
        }

        incidentService.deleteIncident(id);
        return ResponseEntity.ok(ApiResponse.success("Incident deleted successfully", null));
    }

    // ── Inner classes ─────────────────────────────────────────────────────
    @lombok.Getter @lombok.Setter
    public static class ResolutionRequest {
        private String note;
    }
}