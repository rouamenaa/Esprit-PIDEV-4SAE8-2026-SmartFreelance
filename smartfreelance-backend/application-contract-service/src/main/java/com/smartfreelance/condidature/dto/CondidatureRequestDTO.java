package com.smartfreelance.condidature.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondidatureRequestDTO {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Freelancer ID is required")
    private Long freelancerId;

    private String coverLetter;

    @Positive(message = "Proposed price must be positive")
    private Double proposedPrice;

    @Positive(message = "Estimated delivery days must be positive")
    private Integer estimatedDeliveryDays;

    /** Optional freelancer rating 0–5 (for ranking when available). */
    @JsonProperty("freelancerRating")
    private Double freelancerRating;

    private CondidatureStatus status;
}
