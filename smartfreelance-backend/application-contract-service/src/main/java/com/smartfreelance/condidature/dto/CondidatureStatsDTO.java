package com.smartfreelance.condidature.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CondidatureStatsDTO {
    /** Total number of candidatures (applications). */
    private Long totalApplications;
    /** Number of candidatures with status ACCEPTED. */
    private Long acceptedCount;
    /** Acceptance rate 0–100, from status column (PENDING/REJECTED/WITHDRAWN/ACCEPTED). */
    private Double acceptanceRatePercent;
    /** Number of applications per project (count by project_id in database). */
    private List<ApplicationsPerProjectDTO> applicationsPerProject;
    /** Freelancer success rate from freelancer_rating data (average rating 0–5 → 0–100%). */
    private List<FreelancerSuccessRateDTO> freelancerSuccessRates;
}
