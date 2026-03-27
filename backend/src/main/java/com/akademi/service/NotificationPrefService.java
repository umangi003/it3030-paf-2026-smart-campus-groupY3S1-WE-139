package com.akademi.service;

import com.akademi.dto.request.NotificationPrefRequest;
import com.akademi.model.NotificationPreference;
import com.akademi.model.User;
import com.akademi.repository.NotificationPrefRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationPrefService {

    private final NotificationPrefRepository notificationPrefRepository;

    public NotificationPreference getPreferences(Long userId) {
        return notificationPrefRepository.findByUserId(userId)
                .orElseGet(NotificationPreference::new);
    }

    public NotificationPreference updatePreferences(Long userId, NotificationPrefRequest request, User user) {
        NotificationPreference prefs = notificationPrefRepository.findByUserId(userId)
                .orElse(NotificationPreference.builder().user(user).build());

        prefs.setEmailEnabled(request.isEmailEnabled());
        prefs.setPushEnabled(request.isPushEnabled());
        prefs.setBookingNotifications(request.isBookingNotifications());
        prefs.setIncidentNotifications(request.isIncidentNotifications());
        prefs.setSlaNotifications(request.isSlaNotifications());
        prefs.setGeneralNotifications(request.isGeneralNotifications());

        return notificationPrefRepository.save(prefs);
    }
}
