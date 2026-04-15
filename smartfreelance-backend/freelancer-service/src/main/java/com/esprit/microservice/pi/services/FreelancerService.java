package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.DTO.ProfileAnalyticsDTO;
import com.esprit.microservice.pi.DTO.ProfileCompletionDTO;
import com.esprit.microservice.pi.DTO.SkillRecommendationDTO;
import com.esprit.microservice.pi.entites.*;
import com.esprit.microservice.pi.repositories.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FreelancerService {

    private final FreelancerRepository freelancerRepo;
    private final SkillRepository skillRepo;
    private final PortfolioRepository portfolioRepo;

    public FreelancerService(FreelancerRepository freelancerRepo,
                             SkillRepository skillRepo,
                             PortfolioRepository portfolioRepo) {
        this.freelancerRepo = freelancerRepo;
        this.skillRepo = skillRepo;
        this.portfolioRepo = portfolioRepo;
    }

    // ─────────────────────────────────────────────
    // 🔹 PROFILE CRUD
    // ─────────────────────────────────────────────

    public FreelancerProfile getProfile(Long userId) {
        return freelancerRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public FreelancerProfile updateProfile(Long userId, FreelancerProfile updated) {
        FreelancerProfile profile = freelancerRepo.findById(userId)
                .orElse(new FreelancerProfile());

        if (profile.getId() == null) {
            profile.setId(userId);
        }

        profile.setFirstName(updated.getFirstName());
        profile.setLastName(updated.getLastName());
        profile.setTitle(updated.getTitle());
        profile.setOverview(updated.getOverview());
        profile.setHourlyRate(updated.getHourlyRate());
        profile.setExperienceLevel(updated.getExperienceLevel());
        profile.setAvailability(updated.getAvailability());
        profile.setCountry(updated.getCountry());

        return freelancerRepo.save(profile);
    }

    // ─────────────────────────────────────────────
    // 🔹 SKILL CRUD
    // ─────────────────────────────────────────────

    public Skill addSkill(Long userId, Skill skill) {
        FreelancerProfile profile = getProfile(userId);
        skill.setFreelancer(profile);
        return skillRepo.save(skill);
    }

    public List<Skill> getSkills(Long userId) {
        return getProfile(userId).getSkills();
    }

    public Skill updateSkill(Long skillId, Skill updated) {
        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        skill.setName(updated.getName());
        skill.setLevel(updated.getLevel());

        return skillRepo.save(skill);
    }

    public void deleteSkill(Long skillId) {
        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        FreelancerProfile profile = skill.getFreelancer();
        if (profile != null) {
            profile.getSkills().removeIf(s -> s.getId().equals(skillId));
            freelancerRepo.save(profile);
        } else {
            skillRepo.deleteById(skillId);
        }
    }

    // ─────────────────────────────────────────────
    // 🔹 PORTFOLIO CRUD
    // ─────────────────────────────────────────────

    public PortfolioProject addProject(Long userId, PortfolioProject project) {
        FreelancerProfile profile = getProfile(userId);
        project.setFreelancer(profile);
        return portfolioRepo.save(project);
    }

    public List<PortfolioProject> getProjects(Long userId) {
        return getProfile(userId).getProjects();
    }

    public PortfolioProject updateProject(Long projectId, PortfolioProject updated) {
        PortfolioProject project = portfolioRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setTitle(updated.getTitle());
        project.setDescription(updated.getDescription());
        project.setProjectUrl(updated.getProjectUrl());
        project.setTechnologiesUsed(updated.getTechnologiesUsed());

        return portfolioRepo.save(project);
    }

    public void deleteProject(Long projectId) {
        PortfolioProject project = portfolioRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        FreelancerProfile profile = project.getFreelancer();
        if (profile != null) {
            profile.getProjects().removeIf(p -> p.getId().equals(projectId));
            freelancerRepo.save(profile);
        } else {
            portfolioRepo.deleteById(projectId);
        }
    }

    // ─────────────────────────────────────────────
    // 🔹 ADVANCED FEATURE 1 — Profile Analytics
    // ─────────────────────────────────────────────

    /**
     * Returns key statistics about a freelancer's profile:
     * total skills, total projects, hourly rate, and years of experience
     * derived from experienceLevel (Beginner=1, Intermediate=3, Advanced=6, Expert=10).
     */
    public ProfileAnalyticsDTO getProfileAnalytics(Long userId) {
        FreelancerProfile profile = getProfile(userId);

        int totalSkills   = profile.getSkills()   != null ? profile.getSkills().size()   : 0;
        int totalProjects = profile.getProjects()  != null ? profile.getProjects().size() : 0;

        int experienceInYears = mapExperienceLevelToYears(profile.getExperienceLevel());

        return new ProfileAnalyticsDTO(
                totalSkills,
                totalProjects,
                profile.getHourlyRate(),
                experienceInYears
        );
    }

    /** Maps the experienceLevel string to an approximate number of years. */
    private int mapExperienceLevelToYears(String level) {
        if (level == null) return 0;
        return switch (level.trim().toLowerCase()) {
            case "beginner"     -> 1;
            case "intermediate" -> 3;
            case "advanced"     -> 6;
            case "expert"       -> 10;
            default             -> 0;
        };
    }

    // ─────────────────────────────────────────────
    // 🔹 ADVANCED FEATURE 2 — Profile Completion
    // ─────────────────────────────────────────────

    /**
     * Calculates how complete the freelancer's profile is (0–100 %).
     * Each of the 10 fields below contributes 10 points.
     * Also returns the list of missing fields so the frontend can guide the user.
     *
     * Fields evaluated:
     *   firstName, lastName, title, overview, hourlyRate,
     *   experienceLevel, availability, country, skills (≥1), projects (≥1)
     */
    public ProfileCompletionDTO getProfileCompletion(Long userId) {
        FreelancerProfile p = getProfile(userId);
        List<String> missing = new ArrayList<>();

        if (isBlank(p.getFirstName()))       missing.add("firstName");
        if (isBlank(p.getLastName()))        missing.add("lastName");
        if (isBlank(p.getTitle()))           missing.add("title");
        if (isBlank(p.getOverview()))        missing.add("overview");
        if (p.getHourlyRate() == null)       missing.add("hourlyRate");
        if (isBlank(p.getExperienceLevel())) missing.add("experienceLevel");
        if (isBlank(p.getAvailability()))    missing.add("availability");
        if (isBlank(p.getCountry()))         missing.add("country");
        if (p.getSkills()   == null || p.getSkills().isEmpty())   missing.add("skills (add at least 1)");
        if (p.getProjects() == null || p.getProjects().isEmpty()) missing.add("projects (add at least 1)");

        int totalFields = 10;
        int filled      = totalFields - missing.size();
        int percentage  = (int) Math.round((filled / (double) totalFields) * 100);

        return new ProfileCompletionDTO(percentage, missing);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    // ─────────────────────────────────────────────
    // 🔹 ADVANCED FEATURE 3 — Skill Recommendation
    // ─────────────────────────────────────────────

    /**
     * Analyses the freelancer's current skills and returns:
     *  - dominantSkill  : the skill with the highest level
     *  - topSkills      : up to 3 skills sorted by level (Expert > Advanced > Intermediate > Beginner)
     *  - globalSkillScore: weighted average score (Beginner=1, Intermediate=2, Advanced=3, Expert=4)
     *                      normalised to 0–100
     *
     * Recommended next skills are derived from the dominant skill category using a
     * simple built-in mapping (no external AI call required).
     */
    public SkillRecommendationDTO getSkillRecommendation(Long userId) {
        FreelancerProfile profile = getProfile(userId);
        List<Skill> skills = profile.getSkills();

        if (skills == null || skills.isEmpty()) {
            return new SkillRecommendationDTO("N/A", Collections.emptyList(), 0);
        }

        // Sort skills by level weight descending
        List<Skill> sorted = skills.stream()
                .sorted(Comparator.comparingInt(s -> -levelWeight(s.getLevel())))
                .collect(Collectors.toList());

        // Dominant skill = highest-level skill name
        String dominantSkill = sorted.get(0).getName();

        // Top 3 skills by level
        List<String> topSkills = sorted.stream()
                .limit(3)
                .map(Skill::getName)
                .collect(Collectors.toList());

        // Global score: weighted average normalised to 0–100
        double avgWeight = skills.stream()
                .mapToInt(s -> levelWeight(s.getLevel()))
                .average()
                .orElse(0);
        int globalSkillScore = (int) Math.round((avgWeight / 4.0) * 100);

        return new SkillRecommendationDTO(dominantSkill, topSkills, globalSkillScore);
    }

    /** Returns a numeric weight for a skill level string. */
    private int levelWeight(String level) {
        if (level == null) return 0;
        return switch (level.trim().toLowerCase()) {
            case "beginner"     -> 1;
            case "intermediate" -> 2;
            case "advanced"     -> 3;
            case "expert"       -> 4;
            default             -> 0;
        };
    }
}