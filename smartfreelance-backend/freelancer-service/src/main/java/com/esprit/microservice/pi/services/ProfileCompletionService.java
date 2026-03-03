package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.DTO.ProfileCompletionDTO;
import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.repositories.FreelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileCompletionService {

    private final FreelancerRepository repository;

    public ProfileCompletionDTO calculateCompletion(Long profileId) {

        FreelancerProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        int percentage = 0;
        List<String> missing = new ArrayList<>();

        // Name
        if (profile.getFirstName() != null && !profile.getFirstName().isBlank()
                && profile.getLastName() != null && !profile.getLastName().isBlank()) {
            percentage += 10;
        } else {
            missing.add("Add your first and last name");
        }

        // Title
        if (profile.getTitle() != null && !profile.getTitle().isBlank()) {
            percentage += 10;
        } else {
            missing.add("Add professional title");
        }

        // Overview
        if (profile.getOverview() != null && !profile.getOverview().isBlank()) {
            percentage += 20;
        } else {
            missing.add("Add profile overview");
        }

        // Hourly Rate
        if (profile.getHourlyRate() != null && profile.getHourlyRate().compareTo(BigDecimal.ZERO) > 0) {
            percentage += 10;
        } else {
            missing.add("Set hourly rate");
        }

        // Experience Level
        if (profile.getExperienceLevel() != null && !profile.getExperienceLevel().isBlank()) {
            percentage += 10;
        } else {
            missing.add("Select experience level");
        }

        // Availability
        if (profile.getAvailability() != null && !profile.getAvailability().isBlank()) {
            percentage += 5;
        } else {
            missing.add("Set availability");
        }

        // Country
        if (profile.getCountry() != null && !profile.getCountry().isBlank()) {
            percentage += 5;
        } else {
            missing.add("Add country");
        }

        // Skills
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            percentage += 15;
        } else {
            missing.add("Add at least one skill");
        }

        // Projects
        if (profile.getProjects() != null && !profile.getProjects().isEmpty()) {
            percentage += 15;
        } else {
            missing.add("Add at least one portfolio project");
        }

        return new ProfileCompletionDTO(percentage, missing);
    }
}