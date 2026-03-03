package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.DTO.SkillRecommendationDTO;
import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.entites.Skill;
import com.esprit.microservice.pi.repositories.FreelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillRecommendationService {

    private final FreelancerRepository repository;

    public SkillRecommendationDTO analyzeSkills(Long profileId) {

        FreelancerProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (profile.getSkills() == null || profile.getSkills().isEmpty()) {
            return new SkillRecommendationDTO(null, List.of(), 0);
        }

        Map<String, Integer> skillScores = new HashMap<>();
        int globalScore = 0;

        for (Skill skill : profile.getSkills()) {

            int score = mapLevelToScore(skill.getLevel());

            skillScores.put(skill.getName(),
                    skillScores.getOrDefault(skill.getName(), 0) + score);

            globalScore += score;
        }

        // Trier par score décroissant
        List<String> topSkills = skillScores.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(Map.Entry::getKey)
                .limit(3)
                .collect(Collectors.toList());

        String dominantSkill = topSkills.isEmpty() ? null : topSkills.get(0);

        return new SkillRecommendationDTO(
                dominantSkill,
                topSkills,
                globalScore
        );
    }

    private int mapLevelToScore(String level) {

        if (level == null) return 0;

        return switch (level.toLowerCase()) {
            case "junior" -> 1;
            case "mid" -> 2;
            case "senior" -> 3;
            case "expert" -> 4;
            default -> 1;
        };
    }
}