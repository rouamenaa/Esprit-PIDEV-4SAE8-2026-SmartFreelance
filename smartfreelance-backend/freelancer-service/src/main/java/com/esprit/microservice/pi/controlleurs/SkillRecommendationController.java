package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.DTO.SkillRecommendationDTO;
import com.esprit.microservice.pi.services.SkillRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class SkillRecommendationController {

    private final SkillRecommendationService recommendationService;

    @GetMapping("/{id}/recommendation")
    public SkillRecommendationDTO getRecommendation(@PathVariable Long id) {
        return recommendationService.analyzeSkills(id);
    }
}