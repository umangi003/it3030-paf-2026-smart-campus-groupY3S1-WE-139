package com.akademi.service;

import com.akademi.dto.response.AnalyticsResponse;
import com.akademi.enums.BookingStatus;
import com.akademi.enums.ResourceStatus;
import com.akademi.enums.TicketStatus;
import com.akademi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final IncidentRepository incidentRepository;
    private final ResourceRepository resourceRepository;
    private final SLARecordRepository slaRecordRepository;

    public AnalyticsResponse getSummary() {
        return AnalyticsResponse.builder()
                // Booking stats
                .totalBookings(bookingRepository.count())
                .confirmedBookings(bookingRepository.findByStatus(BookingStatus.APPROVED).size())
                .cancelledBookings(bookingRepository.findByStatus(BookingStatus.CANCELLED).size())
                .completedBookings(bookingRepository.findByStatus(BookingStatus.COMPLETED).size())
                // Incident stats
                .totalIncidents(incidentRepository.count())
                .openIncidents(incidentRepository.countByStatus(TicketStatus.OPEN))
                .resolvedIncidents(incidentRepository.countByStatus(TicketStatus.RESOLVED))
                .escalatedIncidents(incidentRepository.countByStatus(TicketStatus.ESCALATED))
                // SLA stats
                .slaResponseBreaches(slaRecordRepository.countByResponseBreachedTrue())
                .slaResolveBreaches(slaRecordRepository.countByResolveBreachedTrue())
                // Resource stats
                .totalResources(resourceRepository.count())
                .availableResources(resourceRepository.findByStatus(ResourceStatus.AVAILABLE).size())
                .build();
    }
}
