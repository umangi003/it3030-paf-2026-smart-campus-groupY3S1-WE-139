package com.akademi.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPrefRequest {

    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean bookingNotifications;
    private boolean incidentNotifications;
    private boolean slaNotifications;
    private boolean generalNotifications;
}
