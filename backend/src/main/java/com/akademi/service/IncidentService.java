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

    public Incident createIncident(IncidentRequest request, User reportedBy) {
        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .imageUrl(request.getImageUrl())
                .status(TicketStatus.OPEN)
                .reportedBy(reportedBy)
                .build();
        incident = incidentRepository.save(incident);

        // Create SLA record
        SLARecord sla = SLARecord.builder()
                .incident(incident)
                .responseDueAt(LocalDateTime.now().plusHours(responseHours))
                .resolveDueAt(LocalDateTime.now().plusHours(resolveHours))
                .build();
        slaRecordRepository.save(sla);

        return incident;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> getUserIncidents(Long userId) {
        return incidentRepository.findByReportedById(userId);
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

    public Incident assignIncident(Long incidentId, Long assignToUserId) {
        Incident incident = getIncidentById(incidentId);
        User assignee = userRepository.findById(assignToUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", assignToUserId));
        incident.setAssignedTo(assignee);
        return incidentRepository.save(incident);
    }
}
