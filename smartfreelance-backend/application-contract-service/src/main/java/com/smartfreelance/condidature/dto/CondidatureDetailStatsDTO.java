package com.smartfreelance.condidature.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Statistics related to a single candidature: for its project and its freelancer.
 * Shown in the candidature details view.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CondidatureDetailStatsDTO {
    /** Number of applications for this candidature's project. */
    private Long projectApplicationsCount;
    /** Number of accepted candidatures for this project (from status column). */
    private Long projectAcceptedCount;
    /** Acceptance rate % for this project (0–100). */
    private Double projectAcceptanceRatePercent;

    /** Total applications by this candidature's freelancer. */
    private Long freelancerTotalApplications;
    /** Average freelancer_rating (0–5) for this freelancer's candidatures. */
    private Double freelancerAverageRating;
    /** Freelancer success rate % (0–100) from freelancer_rating: (averageRating / 5 * 100). */
    private Double freelancerSuccessRatePercent;
}
