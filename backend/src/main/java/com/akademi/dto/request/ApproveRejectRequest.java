package com.akademi.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApproveRejectRequest {
    // Reason is required when rejecting, optional when approving
    private String reason;
}