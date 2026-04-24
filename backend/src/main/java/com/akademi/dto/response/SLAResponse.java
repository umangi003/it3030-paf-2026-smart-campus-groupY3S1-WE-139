package com.akademi.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SLAResponse {

    private Long id;
    private Long incidentId;
    private LocalDateTime responseDueAt;
    private LocalDateTime resolveDueAt;
    private boolean responseBreached;
    private boolean resolveBreached;
    private LocalDateTime escalatedAt;
}
