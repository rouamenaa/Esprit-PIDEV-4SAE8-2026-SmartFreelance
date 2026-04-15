package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.repository.ProjectPhaseRepository;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectPhaseServiceImpl implements ProjectPhaseService {

    private final ProjectPhaseRepository projectPhaseRepository;
    private final ProjectRepository projectRepository;

    public ProjectPhaseServiceImpl(ProjectPhaseRepository projectPhaseRepository,
                                   ProjectRepository projectRepository) {
        this.projectPhaseRepository = projectPhaseRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    public ProjectPhase createPhase(ProjectPhase phase) {

        if (phase.getProjectId() == null) {
            throw new RuntimeException("Project ID is required");
        }

        Project project = projectRepository.findById(phase.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        phase.setProject(project);

        return projectPhaseRepository.save(phase);
    }

    @Override
    public List<ProjectPhase> getPhasesByProjectId(Long projectId) {
        return projectPhaseRepository.findByProject_Id(projectId);
    }

    @Override
    public ProjectPhase getPhaseById(Long id) {
        return projectPhaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
    }

    @Override
    public ProjectPhase updatePhase(Long id, ProjectPhase phase) {

        ProjectPhase existing = getPhaseById(id);

        existing.setName(phase.getName());
        existing.setStartDate(phase.getStartDate());
        existing.setEndDate(phase.getEndDate());
        existing.setStatus(phase.getStatus());

        return projectPhaseRepository.save(existing);
    }

    @Override
    public void deletePhase(Long id) {
        projectPhaseRepository.deleteById(id);
    }
}