package com.smartfreelance.projectservice.dto.external;

import lombok.Data;

@Data
public class ContratExternalDTO {
    private Long id;
    private Long clientId;
    private Long freelancerId;
    private String statut;
}
