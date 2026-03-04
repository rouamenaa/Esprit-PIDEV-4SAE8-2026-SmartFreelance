package com.smartfreelance.condidature.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondidatureDTO {

    private Long id;
    private Long projectId;
    private Long freelancerId;
    private String coverLetter;
    private Double proposedPrice;
    private Integer estimatedDeliveryDays;
    /** Freelancer rating 0–5 (DB column: freelancer_rating). Exposed as freelancer_rating in JSON to match DB. */
    @JsonProperty("freelancer_rating")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private Double freelancerRating;
    private CondidatureStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
