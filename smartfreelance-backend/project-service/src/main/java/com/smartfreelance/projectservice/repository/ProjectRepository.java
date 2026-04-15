package com.smartfreelance.projectservice.repository;

import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByClientId(Long clientId);

    List<Project> findByFreelancerId(Long freelancerId);

}
