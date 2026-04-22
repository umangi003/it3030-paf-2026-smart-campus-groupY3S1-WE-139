package com.akademi.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPrefResponse {
    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean bookingNotifications;
    private boolean incidentNotifications;
    private boolean slaNotifications;
    private boolean generalNotifications;
}