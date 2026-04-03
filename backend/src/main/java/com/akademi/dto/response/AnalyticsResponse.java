package com.akademi.dto.response;

import lombok.*;

import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsResponse {

    // Booking stats
    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long completedBookings;

    // Incident stats
    private long totalIncidents;
    private long openIncidents;
    private long resolvedIncidents;
    private long escalatedIncidents;

    // SLA stats
    private long slaResponseBreaches;
    private long slaResolveBreaches;

    // Resource stats
    private long totalResources;
    private long availableResources;

    // Breakdown maps
    private Map<String, Long> bookingsByResource;
    private Map<String, Long> incidentsByStatus;
}
