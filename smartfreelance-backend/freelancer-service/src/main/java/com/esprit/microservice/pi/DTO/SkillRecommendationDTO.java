package com.esprit.microservice.pi.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SkillRecommendationDTO {

    private String dominantSkill;
    private List<String> topSkills;
    private int globalSkillScore;
}