package com.smartfreelance.condidature.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratFraudIssueDTO {
    private Long contractId;
    private String issueType;
    private String severity;
    private String explanation;
}
