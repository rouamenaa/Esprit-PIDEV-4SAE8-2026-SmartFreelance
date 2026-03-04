package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }


        @GetMapping("/hello")
        public String hello() {
            return "Hello Gateway works!";
        }










    // ================= CREATE =================

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    // ================= APPROVE =================

    @PutMapping("/{id}/approve")
    public Project approveProject(@PathVariable Long id) {
        return projectService.approveProject(id);
    }

    // ================= START =================

    @PutMapping("/{id}/start")
    public Project startProject(@PathVariable Long id) {
        return projectService.startProject(id);
    }

    // ================= DELIVER =================

    @PutMapping("/{id}/deliver")
    public Project deliverProject(@PathVariable Long id) {
        return projectService.deliverProject(id);
    }

    // ================= COMPLETE =================

    @PutMapping("/{id}/complete")
    public Project completeProject(@PathVariable Long id) {
        return projectService.completeProject(id);
    }

    // ================= CANCEL =================

    @PutMapping("/{id}/cancel")
    public Project cancelProject(@PathVariable Long id) {
        return projectService.cancelProject(id);
    }

    // ================= GET ALL =================

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    // ================= GET BY ID =================

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    // ================= UPDATE =================

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id,
                                 @RequestBody Project updatedProject) {
        return projectService.updateProject(id, updatedProject);
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }

    // ================= PROJECT PROGRESS =================

    @GetMapping("/{id}/progress")
    public double getProjectProgress(@PathVariable Long id) {
        return projectService.calculateProjectProgress(id);
    }

    // 🚀 ================= PERFORMANCE INDEX =================

    @GetMapping("/{id}/performance")
    public double getProjectPerformance(@PathVariable Long id) {
        return projectService.calculateProjectPerformanceIndex(id);
    }

    // 🚀 ================= PERFORMANCE LEVEL =================

    @GetMapping("/{id}/performance-level")
    public String getProjectPerformanceLevel(@PathVariable Long id) {
        return projectService.classifyProjectPerformance(id);
    }
    
}