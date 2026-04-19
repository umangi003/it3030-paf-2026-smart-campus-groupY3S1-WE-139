package com.akademi.dto.response;

import com.akademi.enums.TicketCategory;
import com.akademi.enums.TicketPriority;
import com.akademi.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;

    private String contactPhone;
  

    private List<String> imageUrls;

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