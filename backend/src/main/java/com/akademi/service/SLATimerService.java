package com.akademi.service;

import com.akademi.enums.NotificationCategory;
import com.akademi.enums.TicketStatus;
import com.akademi.model.Incident;
import com.akademi.model.SLARecord;
import com.akademi.repository.SLARecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SLATimerService {

    private final SLARecordRepository slaRecordRepository;
    private final NotificationService notificationService;

    // Runs every 30 minutes to check for SLA breaches
    @Scheduled(fixedRate = 1800000)
    public void checkResponseBreaches() {
        log.info("Checking SLA response breaches...");
        List<SLARecord> breaches = slaRecordRepository
                .findUnmarkedResponseBreaches(LocalDateTime.now());

        for (SLARecord sla : breaches) {
            sla.setResponseBreached(true);
            slaRecordRepository.save(sla);

            Incident incident = sla.getIncident();

            // Notify the reporter
            notificationService.sendNotification(
                    incident.getReportedBy(),
                    "SLA Response Breach",
                    "Incident #" + incident.getId() + " has not been responded to within the SLA window.",
                    NotificationCategory.SLA_BREACH,
                    incident.getId(),
                    "INCIDENT"
            );

            log.warn("SLA response breach for incident #{}", incident.getId());
        }
    }

    // Runs every 30 minutes to check for resolution breaches
    @Scheduled(fixedRate = 1800000)
    public void checkResolveBreaches() {
        log.info("Checking SLA resolve breaches...");
        List<SLARecord> breaches = slaRecordRepository
                .findUnmarkedResolveBreaches(LocalDateTime.now());

        for (SLARecord sla : breaches) {
            // Only breach if incident is not already resolved
            if (sla.getIncident().getStatus() != TicketStatus.RESOLVED
                    && sla.getIncident().getStatus() != TicketStatus.CLOSED) {

                sla.setResolveBreached(true);
                sla.setEscalatedAt(LocalDateTime.now());
                slaRecordRepository.save(sla);

                Incident incident = sla.getIncident();

                // Notify the reporter
                notificationService.sendNotification(
                        incident.getReportedBy(),
                        "SLA Resolution Breach",
                        "Incident #" + incident.getId() + " has exceeded the resolution SLA window.",
                        NotificationCategory.SLA_BREACH,
                        incident.getId(),
                        "INCIDENT"
                );

                log.warn("SLA resolve breach for incident #{}", incident.getId());
            }
        }
    }

    // Runs every hour to send SLA warnings (1 hour before breach)
    @Scheduled(fixedRate = 3600000)
    public void checkUpcomingBreaches() {
        log.info("Checking upcoming SLA breaches...");
        LocalDateTime warningThreshold = LocalDateTime.now().plusHours(1);

        List<SLARecord> upcoming = slaRecordRepository
                .findUnmarkedResponseBreaches(warningThreshold);

        for (SLARecord sla : upcoming) {
            Incident incident = sla.getIncident();
            notificationService.sendNotification(
                    incident.getReportedBy(),
                    "SLA Warning",
                    "Incident #" + incident.getId() + " is approaching its SLA deadline.",
                    NotificationCategory.SLA_WARNING,
                    incident.getId(),
                    "INCIDENT"
            );
        }
    }
}
