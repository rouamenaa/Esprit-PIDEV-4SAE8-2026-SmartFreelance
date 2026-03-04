package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.entites.*;
import com.esprit.microservice.pi.repositories.*;
import org.springframework.stereotype.Service;

import java.util.List;

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

    // 🔹 PROFILE CRUD

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

    // 🔹 SKILL CRUD

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

    // 🔹 PORTFOLIO CRUD

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
}
