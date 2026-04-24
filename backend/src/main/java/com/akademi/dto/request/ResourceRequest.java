package com.akademi.dto.request;

import com.akademi.enums.ResourceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    private Integer capacity;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String imageUrl;

    private LocalTime openingTime;

    private LocalTime closingTime;
}
