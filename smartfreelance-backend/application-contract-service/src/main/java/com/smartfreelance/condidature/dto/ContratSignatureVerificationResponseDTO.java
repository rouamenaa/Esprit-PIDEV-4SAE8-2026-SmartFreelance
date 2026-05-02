package com.smartfreelance.condidature.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContratSignatureVerificationResponseDTO {
    private Long contractId;
    private String role;
    private int similarityScore;
    private String verdict;
    private String message;
}
