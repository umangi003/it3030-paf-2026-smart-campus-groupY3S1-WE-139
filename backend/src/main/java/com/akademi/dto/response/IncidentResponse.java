package com.akademi.dto.response;

import com.akademi.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private TicketStatus status;
    private String imageUrl;
    private Long reportedById;
    private String reportedByName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime respondedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private SLAResponse sla;
}
