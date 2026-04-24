package com.akademi.service;

import com.akademi.dto.response.AnalyticsResponse;
import com.akademi.dto.response.AnalyticsResponse.*;
import com.akademi.enums.BookingStatus;
import com.akademi.enums.ResourceStatus;
import com.akademi.enums.TicketStatus;
import com.akademi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final IncidentRepository incidentRepository;
    private final ResourceRepository resourceRepository;
    private final SLARecordRepository slaRecordRepository;

    public AnalyticsResponse getSummary() {

        // Top resources 
        List<ResourceBookingStat> topResources = bookingRepository
                .findTopResourcesByBookingCount()
                .stream()
                .limit(5)
                .map(row -> ResourceBookingStat.builder()
                        .resourceName((String) row[0])
                        .bookingCount(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // Peak booking hours
        List<PeakHourStat> peakHours = bookingRepository
                .findPeakBookingHours()
                .stream()
                .map(row -> {
                    int hour = ((Number) row[0]).intValue();
                    long count = ((Number) row[1]).longValue();
                    return PeakHourStat.builder()
                            .hour(hour)
                            .label(formatHour(hour))
                            .bookingCount(count)
                            .build();
                })
                .collect(Collectors.toList());

        // Daily bookings for last 7 days
        List<DailyBookingStat> dailyBookings = bookingRepository
                .findBookingsLast7Days()
                .stream()
                .map(row -> DailyBookingStat.builder()
                        .date(row[0].toString())
                        .bookingCount(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // Resource utilisation
        List<ResourceUtilisationStat> utilisation = bookingRepository
                .findResourceUtilisation()
                .stream()
                .map(row -> ResourceUtilisationStat.builder()
                        .resourceName((String) row[0])
                        .bookingCount(((Number) row[1]).longValue())
                        .totalHours(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                // Booking stats — using APPROVED to match your BookingStatus enum
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
                // Resource analytics
                .topResources(topResources)
                .peakHours(peakHours)
                .dailyBookings(dailyBookings)
                .resourceUtilisation(utilisation)
                .build();
    }

    private String formatHour(int hour) {
        if (hour == 0) return "12 AM";
        if (hour < 12) return hour + " AM";
        if (hour == 12) return "12 PM";
        return (hour - 12) + " PM";
    }
}