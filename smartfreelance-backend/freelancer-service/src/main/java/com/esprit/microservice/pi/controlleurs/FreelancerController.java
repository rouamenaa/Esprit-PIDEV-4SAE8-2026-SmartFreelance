package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.entites.PortfolioProject;
import com.esprit.microservice.pi.entites.Skill;
import com.esprit.microservice.pi.services.FreelancerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class FreelancerController {

    private final FreelancerService service;

    public FreelancerController(FreelancerService service) {
        this.service = service;
    }

    // 🔹 PROFILE
    @GetMapping("/{userId}")
    public FreelancerProfile getProfile(@PathVariable Long userId) {
        return service.getProfile(userId);
    }

    @PutMapping("/{userId}")
    public FreelancerProfile updateProfile(@PathVariable Long userId,
                                           @RequestBody FreelancerProfile profile) {
        return service.updateProfile(userId, profile);
    }

    // 🔹 SKILLS
    @PostMapping("/{userId}/skills")
    public Skill addSkill(@PathVariable Long userId,
                          @RequestBody Skill skill) {
        return service.addSkill(userId, skill);
    }

    @GetMapping("/{userId}/skills")
    public List<Skill> getSkills(@PathVariable Long userId) {
        return service.getSkills(userId);
    }

    @PutMapping("/skills/{skillId}")
    public Skill updateSkill(@PathVariable Long skillId,
                             @RequestBody Skill skill) {
        return service.updateSkill(skillId, skill);
    }

    @DeleteMapping("/skills/{skillId}")
    public void deleteSkill(@PathVariable Long skillId) {
        service.deleteSkill(skillId);
    }

    // 🔹 PROJECTS
    @PostMapping("/{userId}/projects")
    public PortfolioProject addProject(@PathVariable Long userId,
                                       @Valid @RequestBody PortfolioProject project) {
        return service.addProject(userId, project);
    }

    @GetMapping("/{userId}/projects")
    public List<PortfolioProject> getProjects(@PathVariable Long userId) {
        return service.getProjects(userId);
    }

    @PutMapping("/projects/{projectId}")
    public PortfolioProject updateProject(@PathVariable Long projectId,
                                          @Valid @RequestBody PortfolioProject project) {
        return service.updateProject(projectId, project);
    }

    @DeleteMapping("/projects/{projectId}")
    public void deleteProject(@PathVariable Long projectId) {
        service.deleteProject(projectId);
    }
}
