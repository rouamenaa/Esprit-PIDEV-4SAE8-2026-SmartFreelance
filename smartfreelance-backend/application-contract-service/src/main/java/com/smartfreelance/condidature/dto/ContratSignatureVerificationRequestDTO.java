package com.smartfreelance.condidature.dto;

import lombok.Data;

@Data
public class ContratSignatureVerificationRequestDTO {
    private String role;
    private String drawnSignatureDataUrl;
    private String realSignatureDataUrl;
}
