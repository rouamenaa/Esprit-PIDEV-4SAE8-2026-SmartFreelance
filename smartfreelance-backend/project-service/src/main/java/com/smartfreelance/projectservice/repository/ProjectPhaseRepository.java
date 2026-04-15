package com.smartfreelance.projectservice.repository;

import com.smartfreelance.projectservice.entity.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Long> {

    // IMPORTANT : project_Id et pas projectId
    List<ProjectPhase> findByProject_Id(Long projectId);
    List<ProjectPhase> findByNameContaining(String name);
}