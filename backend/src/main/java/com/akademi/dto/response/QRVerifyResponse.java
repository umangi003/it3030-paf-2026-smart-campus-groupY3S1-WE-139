package com.akademi.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QRVerifyResponse {

    private boolean valid;
    private String message;
    private Long bookingId;
    private String userName;
    private String resourceName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime checkedInAt;
}