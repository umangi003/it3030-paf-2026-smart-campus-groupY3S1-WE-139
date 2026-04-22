package com.akademi.service;

import com.akademi.dto.request.IncidentRequest;
import com.akademi.dto.response.IncidentResponse;
import com.akademi.dto.response.SLAResponse;
import com.akademi.enums.NotificationCategory;
import com.akademi.enums.Role;
import com.akademi.enums.TicketStatus;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.Incident;
import com.akademi.model.SLARecord;
import com.akademi.model.User;
import com.akademi.repository.IncidentRepository;
import com.akademi.repository.SLARecordRepository;
import com.akademi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final SLARecordRepository slaRecordRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${akademi.sla.response-hours:4}")
    private int responseHours;

    @Value("${akademi.sla.resolve-hours:24}")
    private int resolveHours;

    public Incident addImageUrls(Long id, List<String> urls) {
        Incident incident = getIncidentById(id);

        // Backend validation — max 3 image attachments allowed
        if (incident.getImageUrls().size() + urls.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 image attachments allowed per incident");
        }

        incident.getImageUrls().addAll(urls);
        return incidentRepository.save(incident);
    }

    public Incident createIncident(IncidentRequest request, User reportedBy) {
        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .category(request.getCategory())
                .priority(request.getPriority())
                .contactPhone(request.getContactPhone())
                .status(TicketStatus.OPEN)
                .reportedBy(reportedBy)
                .build();

        final Incident savedIncident = incidentRepository.save(incident);

        int resolveHrs = switch (request.getPriority()) {
            case CRITICAL -> 4;
            case HIGH -> 24;
            case MEDIUM -> 72;
            case LOW -> 168;
            default -> 24;
        };

        SLARecord sla = SLARecord.builder()
                .incident(savedIncident)
                .responseDueAt(LocalDateTime.now().plusHours(responseHours))
                .resolveDueAt(LocalDateTime.now().plusHours(resolveHrs))
                .build();
        slaRecordRepository.save(sla);

        // Notify the user who reported it
        notificationService.sendNotification(
                reportedBy,
                "Incident Reported",
                "Your incident '" + savedIncident.getTitle() + "' has been submitted successfully.",
                NotificationCategory.INCIDENT_CREATED, savedIncident.getId(), "INCIDENT"
        );

        // Notify all admins
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationService.sendNotification(
                        admin,
                        "New Incident Reported",
                        "A new incident '" + savedIncident.getTitle() + "' has been reported by " + reportedBy.getName(),
                        NotificationCategory.INCIDENT_CREATED, savedIncident.getId(), "INCIDENT"
                )
        );

        return savedIncident;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> getUserIncidents(Long userId) {
        return incidentRepository.findByReportedBy_Id(userId);
    }

    public List<Incident> getAssignedIncidents(Long technicianId) {
        return incidentRepository.findByAssignedTo_Id(technicianId);
    }

    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));
    }

    public Incident updateStatus(Long id, TicketStatus status, User updatedBy) {
        Incident incident = getIncidentById(id);
        incident.setStatus(status);

        if (status == TicketStatus.IN_PROGRESS && incident.getRespondedAt() == null) {
            incident.setRespondedAt(LocalDateTime.now());
        }
        if (status == TicketStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        incident = incidentRepository.save(incident);

        // Notify the reporter
        notificationService.sendNotification(
                incident.getReportedBy(),
                "Incident Status Updated",
                "Your incident '" + incident.getTitle() + "' status changed to " + status.name(),
                status == TicketStatus.RESOLVED ? NotificationCategory.INCIDENT_RESOLVED : NotificationCategory.INCIDENT_UPDATED,
                incident.getId(), "INCIDENT"
        );

        // Notify the assigned technician if any
        if (incident.getAssignedTo() != null) {
            notificationService.sendNotification(
                    incident.getAssignedTo(),
                    "Incident Status Updated",
                    "Incident '" + incident.getTitle() + "' status changed to " + status.name(),
                    status == TicketStatus.RESOLVED ? NotificationCategory.INCIDENT_RESOLVED : NotificationCategory.INCIDENT_UPDATED,
                    incident.getId(), "INCIDENT"
            );
        }

        return incident;
    }

    public Incident addResolutionNote(Long id, String note, User updatedBy) {
        Incident incident = getIncidentById(id);
        incident.setResolutionNote(note);
        return incidentRepository.save(incident);
    }

    public Incident assignIncident(Long incidentId, Long assignToUserId) {
        Incident incident = getIncidentById(incidentId);
        User assignee = userRepository.findById(assignToUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", assignToUserId));
        incident.setAssignedTo(assignee);
        incident = incidentRepository.save(incident);

        // Notify the assigned technician
        notificationService.sendNotification(
                assignee,
                "Incident Assigned to You",
                "Incident '" + incident.getTitle() + "' has been assigned to you.",
                NotificationCategory.INCIDENT_UPDATED, incident.getId(), "INCIDENT"
        );

        // Notify the user who reported it
        notificationService.sendNotification(
                incident.getReportedBy(),
                "Incident Assigned",
                "Your incident '" + incident.getTitle() + "' is now being handled by a technician.",
                NotificationCategory.INCIDENT_UPDATED, incident.getId(), "INCIDENT"
        );

        return incident;
    }

    public Incident rejectIncident(Long id, String reason) {
        Incident incident = getIncidentById(id);
        incident.setStatus(TicketStatus.REJECTED);
        incident.setRejectionReason(reason);
        incident = incidentRepository.save(incident);

        // Notify the reporter
        notificationService.sendNotification(
                incident.getReportedBy(),
                "Incident Rejected",
                "Your incident '" + incident.getTitle() + "' has been rejected. Reason: " + reason,
                NotificationCategory.INCIDENT_UPDATED, incident.getId(), "INCIDENT"
        );

        return incident;
    }

    public void deleteIncident(Long id) {
        Incident incident = getIncidentById(id);
        slaRecordRepository.findByIncidentId(id).ifPresent(slaRecordRepository::delete);
        incidentRepository.delete(incident);
    }

    public IncidentResponse toResponse(Incident incident) {
        SLARecord sla = slaRecordRepository.findByIncidentId(incident.getId()).orElse(null);
        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .location(incident.getLocation())
                .category(incident.getCategory())
                .priority(incident.getPriority())
                .status(incident.getStatus())
                .contactPhone(incident.getContactPhone())
                .imageUrls(incident.getImageUrls())
                .reportedById(incident.getReportedBy() != null ? incident.getReportedBy().getId() : null)
                .reportedByName(incident.getReportedBy() != null ? incident.getReportedBy().getName() : null)
                .assignedToId(incident.getAssignedTo() != null ? incident.getAssignedTo().getId() : null)
                .assignedToName(incident.getAssignedTo() != null ? incident.getAssignedTo().getName() : null)
                .respondedAt(incident.getRespondedAt())
                .resolvedAt(incident.getResolvedAt())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .sla(sla != null ? SLAResponse.builder()
                        .id(sla.getId())
                        .incidentId(incident.getId())
                        .responseDueAt(sla.getResponseDueAt())
                        .resolveDueAt(sla.getResolveDueAt())
                        .responseBreached(sla.isResponseBreached())
                        .resolveBreached(sla.isResolveBreached())
                        .escalatedAt(sla.getEscalatedAt())
                        .build() : null)
                .build();
    }
}
