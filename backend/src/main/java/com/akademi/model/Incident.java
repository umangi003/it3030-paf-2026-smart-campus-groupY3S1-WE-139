package com.akademi.model;

import com.akademi.enums.TicketCategory;
import com.akademi.enums.TicketPriority;
import com.akademi.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    // Contact details provided by the reporter
    private String contactPhone;
    private String contactEmail;
    private String contactAvailability;

    // Up to 3 image attachments stored as URLs
    @ElementCollection
    @CollectionTable(name = "incident_images", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    // Resolution note added by technician or admin
    @Column(name = "resolution_note", length = 2000)
    private String resolutionNote;

    // Rejection reason set by admin
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Transient
    public String getReportedByName() {
        return reportedBy != null ? reportedBy.getName() : null;
    }

    @Transient
    public Long getReportedById() {
        return reportedBy != null ? reportedBy.getId() : null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    @JsonIgnore
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    @JsonIgnore
    private User assignedTo;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Comment> comments;

    @OneToOne(mappedBy = "incident", cascade = CascadeType.ALL)
    @JsonIgnore
    private SLARecord slaRecord;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
