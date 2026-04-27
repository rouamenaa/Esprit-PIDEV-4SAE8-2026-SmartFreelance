package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public Project createProject(Project project) {
        project.setStatus(ProjectStatus.DRAFT);
        return projectRepository.save(project);
    }

    @Override
    public Project approveProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() != ProjectStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only DRAFT projects can be approved");
        }

        project.setStatus(ProjectStatus.APPROVED);
        return projectRepository.save(project);
    }

    @Override
    public Project startProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() != ProjectStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only APPROVED projects can be started");
        }

        project.setStatus(ProjectStatus.IN_PROGRESS);
        return projectRepository.save(project);
    }

    @Override
    public Project deliverProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() != ProjectStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Project must be IN_PROGRESS to be delivered");
        }

        project.setStatus(ProjectStatus.DELIVERED);
        return projectRepository.save(project);
    }

    @Override
    public Project completeProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() != ProjectStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Project must be DELIVERED before completion");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        return projectRepository.save(project);
    }

    @Override
    public Project cancelProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Completed project cannot be cancelled");
        }

        project.setStatus(ProjectStatus.CANCELLED);
        return projectRepository.save(project);
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project getProjectById(Long id) {
        return getProjectOrThrow(id);
    }

    @Override
    public Project updateProject(Long projectId, Project updatedProject) {
        Project project = getProjectOrThrow(projectId);

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Completed project cannot be modified");
        }

        project.setTitle(updatedProject.getTitle());
        project.setDescription(updatedProject.getDescription());
        project.setBudget(updatedProject.getBudget());
        project.setDeadline(updatedProject.getDeadline());
        project.setStartDate(updatedProject.getStartDate()); // 🚀 NEW

        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = getProjectOrThrow(id);

        if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Project in progress cannot be deleted");
        }

        projectRepository.delete(project);
    }

    @Override
    public void autoCompleteProjectIfNeeded(Long projectId) {

        Project project = getProjectOrThrow(projectId);

        boolean allPhasesCompleted = project.getPhases().stream()
                .allMatch(p -> p.getStatus().name().equals("COMPLETED"));

        if (allPhasesCompleted && !project.getPhases().isEmpty()) {
            project.setStatus(ProjectStatus.COMPLETED);
            projectRepository.save(project);
        }
    }

    @Override
    public double calculateProjectProgress(Long projectId) {

        Project project = getProjectOrThrow(projectId);

        long totalTasks = project.getPhases().stream()
                .flatMap(p -> p.getTasks().stream())
                .count();

        long completedTasks = project.getPhases().stream()
                .flatMap(p -> p.getTasks().stream())
                .filter(t -> t.getStatus().name().equals("DONE"))
                .count();

        if (totalTasks == 0) return 0;

        return (completedTasks * 100.0) / totalTasks;
    }


    private double calculateTimeProgress(Project project) {

        if (project.getStartDate() == null || project.getDeadline() == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();

        if (today.isBefore(project.getStartDate())) {
            return 0;
        }

        long totalDuration =
                ChronoUnit.DAYS.between(project.getStartDate(), project.getDeadline());

        long elapsed =
                ChronoUnit.DAYS.between(project.getStartDate(), today);

        if (totalDuration <= 0) return 100;

        double timeProgress = (elapsed * 100.0) / totalDuration;

        return Math.min(timeProgress, 100);
    }

    private double calculateTimeAlignmentScore(double workProgress, double timeProgress) {

        double gap = workProgress - timeProgress;

        if (gap >= 0) return 100;

        return Math.max(0, 100 + gap);
    }

    private double calculateStructureScore(Project project) {

        if (project.getPhases().isEmpty()) return 0;

        long validPhases = project.getPhases().stream()
                .filter(p -> p.getTasks().size() >= 2)
                .count();

        return (validPhases * 100.0) / project.getPhases().size();
    }

    @Override
    public double calculateProjectPerformanceIndex(Long projectId) {

        Project project = getProjectOrThrow(projectId);

        double workProgress = calculateProjectProgress(projectId);
        double timeProgress = calculateTimeProgress(project);
        double alignmentScore = calculateTimeAlignmentScore(workProgress, timeProgress);
        double structureScore = calculateStructureScore(project);

        return (workProgress * 0.5)
                + (alignmentScore * 0.3)
                + (structureScore * 0.2);
    }

    @Override
    public String classifyProjectPerformance(Long projectId) {

        double index = calculateProjectPerformanceIndex(projectId);

        if (index >= 80) return "HIGH_PERFORMANCE";
        if (index >= 50) return "MODERATE";
        return "CRITICAL";
    }


    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found with id: " + id
                ));
    }
}