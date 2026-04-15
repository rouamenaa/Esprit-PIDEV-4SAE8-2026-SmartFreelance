package com.smartfreelance.condidature.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerSuccessRateDTO {
    private Long freelancerId;
    private Long totalApplications;
    /** Average freelancer_rating (0–5) from data for this freelancer. */
    private Double averageRating;
    /** Success rate 0–100 derived from averageRating (averageRating / 5 * 100). */
    private Double successRatePercent;
}
