package com.akademi.dto.response;

import com.akademi.enums.BookingStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingResponse {

    private Long id;
    private Long userId;
    private String userName;        
    private Long resourceId;
    private String resourceName;    
    private String resourceLocation;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private String purpose;
    private Integer attendees;         
    private String rejectionReason;    
    private String qrToken;
    private LocalDateTime qrTokenExpiry;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
}