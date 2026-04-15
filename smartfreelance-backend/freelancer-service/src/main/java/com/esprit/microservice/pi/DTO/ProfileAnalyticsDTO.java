package com.esprit.microservice.pi.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileAnalyticsDTO {
    private int totalSkills;
    private int totalProjects;
    private java.math.BigDecimal hourlyRate;
    private int experienceInYears;
}