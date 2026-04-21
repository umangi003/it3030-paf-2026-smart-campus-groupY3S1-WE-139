package com.akademi.dto.response;

import lombok.*;

import java.util.List;
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

    // Breakdown maps (existing)
    private Map<String, Long> bookingsByResource;
    private Map<String, Long> incidentsByStatus;

    // Resource analytics (new)
    private List<ResourceBookingStat> topResources;
    private List<PeakHourStat> peakHours;
    private List<DailyBookingStat> dailyBookings;
    private List<ResourceUtilisationStat> resourceUtilisation;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResourceBookingStat {
        private String resourceName;
        private long bookingCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PeakHourStat {
        private int hour;
        private String label;
        private long bookingCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DailyBookingStat {
        private String date;
        private long bookingCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResourceUtilisationStat {
        private String resourceName;
        private long bookingCount;
        private long totalHours;
    }
}