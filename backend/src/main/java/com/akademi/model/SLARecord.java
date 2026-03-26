package com.akademi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SLARecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(name = "response_due_at", nullable = false)
    private LocalDateTime responseDueAt;

    @Column(name = "resolve_due_at", nullable = false)
    private LocalDateTime resolveDueAt;

    @Column(name = "response_breached", nullable = false)
    private boolean responseBreached = false;

    @Column(name = "resolve_breached", nullable = false)
    private boolean resolveBreached = false;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
