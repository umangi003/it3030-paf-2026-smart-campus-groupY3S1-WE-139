package com.akademi.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentResponse {

    private Long id;
    private Long incidentId;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private LocalDateTime createdAt;
    private boolean isOwner;
}