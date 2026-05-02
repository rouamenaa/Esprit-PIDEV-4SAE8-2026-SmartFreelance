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
public class ContratFraudScoreDTO {
    private Long contractId;
    private int riskScore;
    private String riskLevel;
    private String recommendation;
    private List<ContratFraudIssueDTO> issues;
}
