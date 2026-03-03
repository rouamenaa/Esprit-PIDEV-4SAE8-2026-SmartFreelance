package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.entites.PortfolioProject;
import com.esprit.microservice.pi.repositories.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @GetMapping
    public ResponseEntity<List<PortfolioProject>> getAllProjects() {
        return ResponseEntity.ok(portfolioRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioProject> getProjectById(@PathVariable Long id) {
        return portfolioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioProject> createProject(@RequestBody PortfolioProject project) {
        return ResponseEntity.ok(portfolioRepository.save(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioProject> updateProject(@PathVariable Long id, @RequestBody PortfolioProject projectDetails) {
        return portfolioRepository.findById(id)
                .map(project -> {
                    project.setTitle(projectDetails.getTitle());
                    project.setDescription(projectDetails.getDescription());
                    project.setProjectUrl(projectDetails.getProjectUrl());
                    project.setTechnologiesUsed(projectDetails.getTechnologiesUsed());
                    return ResponseEntity.ok(portfolioRepository.save(project));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        portfolioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
