package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.ProjectPhase;

import java.util.List;

public interface ProjectPhaseService {
    ProjectPhase createPhase(ProjectPhase phase);
    List<ProjectPhase> getPhasesByProjectId(Long projectId);
    ProjectPhase getPhaseById(Long id);
    ProjectPhase updatePhase(Long id, ProjectPhase phase);
    void deletePhase(Long id);
}
