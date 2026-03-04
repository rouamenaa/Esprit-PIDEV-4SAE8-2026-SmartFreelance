package com.smartfreelance.condidature.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "condidatures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Condidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @NotNull
    @Column(name = "freelancer_id", nullable = false)
    private Long freelancerId;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "proposed_price")
    private Double proposedPrice;

    @Column(name = "estimated_delivery_days")
    private Integer estimatedDeliveryDays;

    /** Optional freelancer rating (0–5). Can be set by freelancer service or left null for ranking to use neutral score. */
    @Column(name = "freelancer_rating")
    private Double freelancerRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private CondidatureStatus status = CondidatureStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CondidatureStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }
}
