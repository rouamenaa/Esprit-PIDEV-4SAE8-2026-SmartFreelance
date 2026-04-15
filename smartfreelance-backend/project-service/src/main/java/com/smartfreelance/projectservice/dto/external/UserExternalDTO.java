package com.smartfreelance.projectservice.dto.external;

import lombok.Data;

@Data
public class UserExternalDTO {
    private Long id;
    private String role;
    private String username;
    private String email;
}
