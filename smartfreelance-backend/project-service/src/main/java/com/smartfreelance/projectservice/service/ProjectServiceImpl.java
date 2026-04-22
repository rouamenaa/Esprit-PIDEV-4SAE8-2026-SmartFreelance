package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.client.ApplicationContractClient;
import com.smartfreelance.projectservice.client.UserServiceClient;
import com.smartfreelance.projectservice.dto.external.CondidatureExternalDTO;
import com.smartfreelance.projectservice.dto.external.ContratExternalDTO;
import com.smartfreelance.projectservice.dto.external.UserExternalDTO;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ApplicationContractClient applicationContractClient;
    private final UserServiceClient userServiceClient;

    public ProjectServiceImpl(ProjectRepository projectRepository,
            ApplicationContractClient applicationContractClient,
            UserServiceClient userServiceClient) {
        this.projectRepository = projectRepository;
        this.applicationContractClient = applicationContractClient;

        this.userServiceClient = userServiceClient;
    }

    @Override
    public Project createProject(Project project) {
        validateClientActor(project.getClientId());
        if (project.getFreelancerId() != null) {
            validateFreelancerActor(project.getFreelancerId());
        }
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

        List<CondidatureExternalDTO> candidatures = getCandidaturesOrThrow(projectId, null);
        boolean hasRelevantCandidates = candidatures.stream()
                .map(CondidatureExternalDTO::getStatus)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .anyMatch(status -> status.equals("PENDING") || status.equals("ACCEPTED"));
        if (!hasRelevantCandidates) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot approve a project without pending or accepted candidatures");
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

        List<CondidatureExternalDTO> accepted = getCandidaturesOrThrow(projectId, "ACCEPTED");
        if (accepted.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot start project without an accepted candidature");
        }

        if (project.getFreelancerId() == null) {
            Long assignedFreelancerId = accepted.stream()
                    .map(CondidatureExternalDTO::getFreelancerId)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Accepted candidature has no freelancerId"));
            validateFreelancerActor(assignedFreelancerId);
            project.setFreelancerId(assignedFreelancerId);
        } else {
            validateFreelancerActor(project.getFreelancerId());
            boolean assignedFreelancerAccepted = accepted.stream()
                    .map(CondidatureExternalDTO::getFreelancerId)
                    .anyMatch(fid -> Objects.equals(fid, project.getFreelancerId()));
            if (!assignedFreelancerAccepted) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Assigned freelancer has no accepted candidature for this project");
            }
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
    public List<Project> getProjectsByClientId(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    @Override
    public List<Project> getProjectsByFreelancerId(Long freelancerId) {
        return projectRepository.findByFreelancerId(freelancerId);
    }

    @Override
    public Project getProjectById(Long id) {
        return getProjectOrThrow(id);
    }

    @Override
    public Project assignFreelancer(Long projectId, Long freelancerId) {
        if (freelancerId == null || freelancerId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "freelancerId is required");
        }
        validateFreelancerActor(freelancerId);

        Project project = getProjectOrThrow(projectId);
        project.setFreelancerId(freelancerId);

        // Keep workflow fluid: accepted candidature means the assigned freelancer can
        // start work.
        if (project.getStatus() == ProjectStatus.APPROVED) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        return projectRepository.save(project);
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
        if (updatedProject.getClientId() != null
                && !Objects.equals(updatedProject.getClientId(), project.getClientId())) {
            validateClientActor(updatedProject.getClientId());
            project.setClientId(updatedProject.getClientId());
        }
        if (updatedProject.getFreelancerId() != null
                && !Objects.equals(updatedProject.getFreelancerId(), project.getFreelancerId())) {
            validateFreelancerActor(updatedProject.getFreelancerId());
            project.setFreelancerId(updatedProject.getFreelancerId());
        }

        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = getProjectOrThrow(id);

        if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Project in progress cannot be deleted");
        }

        List<CondidatureExternalDTO> candidatures = getCandidaturesOrThrow(id, null);
        boolean hasBlockingCandidatures = candidatures.stream()
                .map(CondidatureExternalDTO::getStatus)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .anyMatch(status -> status.equals("PENDING") || status.equals("ACCEPTED"));
        if (hasBlockingCandidatures) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Project cannot be deleted while it has pending or accepted candidatures");
        }

        if (project.getClientId() != null && project.getFreelancerId() != null) {
            List<ContratExternalDTO> activeContracts = getActiveContractsOrThrow(
                    project.getClientId(),
                    project.getFreelancerId());
            if (!activeContracts.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Project cannot be deleted while an active contract exists");
            }
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

        if (totalTasks == 0)
            return 0;

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

        long totalDuration = ChronoUnit.DAYS.between(project.getStartDate(), project.getDeadline());

        long elapsed = ChronoUnit.DAYS.between(project.getStartDate(), today);

        if (totalDuration <= 0)
            return 100;

        double timeProgress = (elapsed * 100.0) / totalDuration;

        return Math.min(timeProgress, 100);
    }

    private double calculateTimeAlignmentScore(double workProgress, double timeProgress) {

        double gap = workProgress - timeProgress;

        if (gap >= 0)
            return 100;

        return Math.max(0, 100 + gap);
    }

    private double calculateStructureScore(Project project) {

        if (project.getPhases().isEmpty())
            return 0;

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

        if (index >= 80)
            return "HIGH_PERFORMANCE";
        if (index >= 50)
            return "MODERATE";
        return "CRITICAL";
    }

    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found with id: " + id));
    }

    @Override
    public Map<String, Object> getProjectProgressDetails(Long projectId) {

        Project project = getProjectOrThrow(projectId);

        long totalTasks = project.getPhases().stream()
                .flatMap(p -> p.getTasks().stream())
                .count();

        long completedTasks = project.getPhases().stream()
                .flatMap(p -> p.getTasks().stream())
                .filter(t -> t.getStatus().name().equals("DONE"))
                .count();

        double progress = totalTasks == 0 ? 0 : (completedTasks * 100.0) / totalTasks;

        Map<String, Object> result = new HashMap<>();
        result.put("totalTasks", totalTasks);
        result.put("completedTasks", completedTasks);
        result.put("progress", progress);

        return result;
    }

    private List<CondidatureExternalDTO> getCandidaturesOrThrow(Long projectId, String status) {
        try {
            List<CondidatureExternalDTO> result = applicationContractClient.getCandidatures(projectId, status);
            return result != null ? result : Collections.emptyList();
        } catch (FeignException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to validate candidatures from application-contract-service",
                    ex);
        }
    }

    private List<ContratExternalDTO> getActiveContractsOrThrow(Long clientId, Long freelancerId) {
        try {
            List<ContratExternalDTO> result = applicationContractClient
                    .getActiveContractsByClientAndFreelancer(clientId, freelancerId);
            return result != null ? result : Collections.emptyList();
        } catch (FeignException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to validate contracts from application-contract-service",
                    ex);
        }
    }

    private void validateClientActor(Long clientId) {
        if (clientId == null || clientId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientId is required");
        }
        UserExternalDTO user = getUserOrThrow(clientId);
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
        if (!role.equals("CLIENT") && !role.equals("ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid clientId: user role must be CLIENT or ADMIN");
        }
    }

    private void validateFreelancerActor(Long freelancerId) {
        if (freelancerId == null || freelancerId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "freelancerId is required");
        }
        UserExternalDTO user = getUserOrThrow(freelancerId);
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
        if (!role.equals("FREELANCER")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid freelancerId: user role must be FREELANCER");
        }
    }

    private UserExternalDTO getUserOrThrow(Long userId) {
        try {
            UserExternalDTO user = userServiceClient.getUserById(userId);
            if (user == null || user.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for id: " + userId);
            }
            return user;
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for id: " + userId, ex);
        } catch (FeignException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to validate users from user-service",
                    ex);
        }
    }

}
