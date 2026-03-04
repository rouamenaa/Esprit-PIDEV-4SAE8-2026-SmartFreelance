package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.service.ProjectPhaseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins = "http://localhost:4200")

@RequestMapping("/api/phases")
public class ProjectPhaseController {

    private final ProjectPhaseService projectPhaseService;

    public ProjectPhaseController(ProjectPhaseService projectPhaseService) {
        this.projectPhaseService = projectPhaseService;
    }

    @PostMapping
    public ProjectPhase createPhase(@RequestBody ProjectPhase phase) {
        return projectPhaseService.createPhase(phase);
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectPhase> getPhasesByProject(@PathVariable Long projectId) {
        return projectPhaseService.getPhasesByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public ProjectPhase getPhase(@PathVariable Long id) {
        return projectPhaseService.getPhaseById(id);
    }

    @PutMapping("/{id}")
    public ProjectPhase updatePhase(@PathVariable Long id, @RequestBody ProjectPhase phase) {
        return projectPhaseService.updatePhase(id, phase);
    }

    @DeleteMapping("/{id}")
    public void deletePhase(@PathVariable Long id) {
        projectPhaseService.deletePhase(id);
    }
}
