package com.akademi.service;

import com.akademi.dto.request.IncidentRequest;
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
import com.akademi.dto.response.IncidentResponse;
import com.akademi.dto.response.SLAResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final SLARecordRepository slaRecordRepository;
    private final UserRepository userRepository;

    @Value("${akademi.sla.response-hours:4}")
    private int responseHours;

    @Value("${akademi.sla.resolve-hours:24}")
    private int resolveHours;
    
    public Incident addImageUrls(Long id, List<String> urls) {
    Incident incident = getIncidentById(id);
    incident.getImageUrls().addAll(urls);
    return incidentRepository.save(incident);
    }
    public Incident createIncident(IncidentRequest request, User reportedBy) {
    Incident incident = Incident.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .location(request.getLocation())
            .category(request.getCategory())        // ✅ new
            .priority(request.getPriority())        // ✅ new
            .contactPhone(request.getContactPhone())        // ✅ new
            .status(TicketStatus.OPEN)
            .reportedBy(reportedBy)
            // imageUrls not set here — added separately via uploadAttachments
            .build();

    incident = incidentRepository.save(incident);

    // Create SLA record
    // Create SLA record with priority-based resolve window
    int resolveHrs = switch (request.getPriority()) {
        case CRITICAL -> 4;
        case HIGH -> 24;
        case MEDIUM -> 72;
        case LOW -> 168;
        default -> 24;
    };

    SLARecord sla = SLARecord.builder()
            .incident(incident)
            .responseDueAt(LocalDateTime.now().plusHours(responseHours))
            .resolveDueAt(LocalDateTime.now().plusHours(resolveHrs))
            .build();
    slaRecordRepository.save(sla);

    return incident;
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

        return incidentRepository.save(incident);
    }

    // Technician adds a resolution note (stored in resolutionNote field)
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
        return incidentRepository.save(incident);
    }

    public Incident rejectIncident(Long id, String reason) {
        Incident incident = getIncidentById(id);
        incident.setStatus(TicketStatus.REJECTED);
        incident.setRejectionReason(reason);
        return incidentRepository.save(incident);
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
