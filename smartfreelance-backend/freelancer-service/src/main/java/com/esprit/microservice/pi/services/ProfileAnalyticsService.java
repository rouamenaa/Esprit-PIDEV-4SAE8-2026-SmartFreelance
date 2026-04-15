package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.DTO.ProfileAnalyticsDTO;
import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.repositories.FreelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileAnalyticsService {

    private final FreelancerRepository repository;

    public ProfileAnalyticsDTO getAnalytics(Long profileId) {

        FreelancerProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // Nombre de compétences
        int totalSkills = (profile.getSkills() != null)
                ? profile.getSkills().size()
                : 0;

        // Nombre de projets
        int totalProjects = (profile.getProjects() != null)
                ? profile.getProjects().size()
                : 0;

        // Tarif horaire sécurisé
        java.math.BigDecimal hourlyRate = profile.getHourlyRate();

        // Expérience convertie en années
        int experienceYears = mapExperienceToYears(profile.getExperienceLevel());

        return new ProfileAnalyticsDTO(
                totalSkills,
                totalProjects,
                hourlyRate,
                experienceYears
        );
    }

    /**
     * Convertit le niveau d'expérience en années
     */
    private int mapExperienceToYears(String level) {
        if (level == null || level.isBlank()) return 0;

        return switch (level.toLowerCase()) {
            case "beginner" -> 1;
            case "intermediate" -> 3;
            case "advanced" -> 5;
            case "expert" -> 8;
            default -> 0;
        };
    }
}