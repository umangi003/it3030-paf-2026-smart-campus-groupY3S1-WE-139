package com.akademi.service;

import com.akademi.dto.request.NotificationPrefRequest;
import com.akademi.dto.response.NotificationPrefResponse;
import com.akademi.model.NotificationPreference;
import com.akademi.model.User;
import com.akademi.repository.NotificationPrefRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationPrefService {

    private final NotificationPrefRepository notificationPrefRepository;

    private NotificationPrefResponse toResponse(NotificationPreference prefs) {
        return NotificationPrefResponse.builder()
                .emailEnabled(prefs.isEmailEnabled())
                .pushEnabled(prefs.isPushEnabled())
                .bookingNotifications(prefs.isBookingNotifications())
                .incidentNotifications(prefs.isIncidentNotifications())
                .slaNotifications(prefs.isSlaNotifications())
                .generalNotifications(prefs.isGeneralNotifications())
                .build();
    }

    public NotificationPrefResponse getPreferences(Long userId) {
        NotificationPreference prefs = notificationPrefRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.builder()
                        .emailEnabled(true)
                        .pushEnabled(true)
                        .bookingNotifications(true)
                        .incidentNotifications(true)
                        .slaNotifications(true)
                        .generalNotifications(true)
                        .build());
        return toResponse(prefs);
    }

    public NotificationPrefResponse updatePreferences(Long userId, NotificationPrefRequest request, User user) {
        NotificationPreference prefs = notificationPrefRepository.findByUserId(userId)
                .orElse(NotificationPreference.builder().user(user).build());

        prefs.setEmailEnabled(request.isEmailEnabled());
        prefs.setPushEnabled(request.isPushEnabled());
        prefs.setBookingNotifications(request.isBookingNotifications());
        prefs.setIncidentNotifications(request.isIncidentNotifications());
        prefs.setSlaNotifications(request.isSlaNotifications());
        prefs.setGeneralNotifications(request.isGeneralNotifications());

        return toResponse(notificationPrefRepository.save(prefs));
    }
}
