package com.smartfreelance.projectservice.dto.external;

import lombok.Data;

@Data
public class CondidatureExternalDTO {
    private Long id;
    private Long projectId;
    private Long freelancerId;
    private String status;
}
