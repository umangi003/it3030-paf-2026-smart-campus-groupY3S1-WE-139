package com.akademi.dto.response;

import com.akademi.enums.Role;
import com.akademi.enums.TicketCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private String profilePicture;
    private LocalDateTime createdAt;
    private String phone;
    private String address;
    private String personalEmail;
    private TicketCategory specialization;
}