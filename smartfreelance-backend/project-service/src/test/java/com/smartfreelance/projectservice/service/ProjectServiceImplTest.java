package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.client.ApplicationContractClient;
import com.smartfreelance.projectservice.client.UserServiceClient;
import com.smartfreelance.projectservice.dto.external.CondidatureExternalDTO;
import com.smartfreelance.projectservice.dto.external.ContratExternalDTO;
import com.smartfreelance.projectservice.dto.external.UserExternalDTO;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceImplTest {

    private ProjectRepository projectRepository;
    private ApplicationContractClient applicationContractClient;
    private UserServiceClient userServiceClient;
    private ProjectServiceImpl service;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        applicationContractClient = mock(ApplicationContractClient.class);
        userServiceClient = mock(UserServiceClient.class);
        service = new ProjectServiceImpl(projectRepository, applicationContractClient, userServiceClient);
    }

    @Test
    void shouldApproveProjectSuccessfully() {
        Project project = project(ProjectStatus.DRAFT, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, null))
                .thenReturn(List.of(candidature("PENDING", 10L)));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project result = service.approveProject(1L);

        assertEquals(ProjectStatus.APPROVED, result.getStatus());
    }

    @Test
    void shouldThrowWhenApprovingNonDraftProject() {
        Project project = project(ProjectStatus.IN_PROGRESS, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.approveProject(1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Only DRAFT projects can be approved"));
    }

    @Test
    void shouldThrowWhenApprovingWithoutRelevantCandidatures() {
        Project project = project(ProjectStatus.DRAFT, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, null))
                .thenReturn(List.of(candidature("REJECTED", 10L)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.approveProject(1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("without pending or accepted candidatures"));
    }

    @Test
    void shouldThrowWhenStartingNonApprovedProject() {
        Project project = project(ProjectStatus.DRAFT, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.startProject(1L));

        assertTrue(ex.getReason().contains("Only APPROVED projects can be started"));
    }

    @Test
    void shouldThrowWhenStartingWithoutAcceptedCandidature() {
        Project project = project(ProjectStatus.APPROVED, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, "ACCEPTED")).thenReturn(Collections.emptyList());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.startProject(1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("without an accepted candidature"));
    }

    @Test
    void shouldStartProjectAndAssignFreelancerFromAcceptedCandidature() {
        Project project = project(ProjectStatus.APPROVED, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, "ACCEPTED"))
                .thenReturn(List.of(candidature("ACCEPTED", 99L)));
        when(userServiceClient.getUserById(99L)).thenReturn(user(99L, "FREELANCER"));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project result = service.startProject(1L);

        assertEquals(ProjectStatus.IN_PROGRESS, result.getStatus());
        assertEquals(99L, result.getFreelancerId());
    }

    @Test
    void shouldThrowWhenAssignedFreelancerHasNoAcceptedCandidature() {
        Project project = project(ProjectStatus.APPROVED, 1L, 77L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userServiceClient.getUserById(77L)).thenReturn(user(77L, "FREELANCER"));
        when(applicationContractClient.getCandidatures(1L, "ACCEPTED"))
                .thenReturn(List.of(candidature("ACCEPTED", 99L)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.startProject(1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Assigned freelancer has no accepted candidature"));
    }

    @Test
    void shouldAssignFreelancerAndMoveProjectToInProgressWhenApproved() {
        Project project = project(ProjectStatus.APPROVED, 1L, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userServiceClient.getUserById(50L)).thenReturn(user(50L, "FREELANCER"));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project result = service.assignFreelancer(1L, 50L);

        assertEquals(50L, result.getFreelancerId());
        assertEquals(ProjectStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void shouldThrowWhenAssignFreelancerIdIsInvalid() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.assignFreelancer(1L, 0L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("freelancerId is required"));
    }

    @Test
    void shouldDeleteProjectSuccessfullyWhenNoBlockingDependencies() {
        Project project = project(ProjectStatus.DRAFT, 1L, 2L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, null)).thenReturn(Collections.emptyList());
        when(applicationContractClient.getActiveContractsByClientAndFreelancer(1L, 2L))
                .thenReturn(Collections.emptyList());

        service.deleteProject(1L);

        verify(projectRepository).delete(project);
    }

    @Test
    void shouldThrowWhenDeletingInProgressProject() {
        Project project = project(ProjectStatus.IN_PROGRESS, 1L, 2L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.deleteProject(1L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("cannot be deleted"));
    }

    @Test
    void shouldThrowWhenDeletingWithPendingCandidatures() {
        Project project = project(ProjectStatus.DRAFT, 1L, 2L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, null))
                .thenReturn(List.of(candidature("PENDING", 55L)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.deleteProject(1L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("pending or accepted candidatures"));
    }

    @Test
    void shouldThrowWhenDeletingWithActiveContract() {
        Project project = project(ProjectStatus.DRAFT, 1L, 2L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(applicationContractClient.getCandidatures(1L, null)).thenReturn(Collections.emptyList());
        when(applicationContractClient.getActiveContractsByClientAndFreelancer(1L, 2L))
                .thenReturn(List.of(new ContratExternalDTO()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.deleteProject(1L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("active contract exists"));
    }

    @Test
    void shouldThrowWhenUpdatingCompletedProject() {
        Project existing = project(ProjectStatus.COMPLETED, 1L, 2L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.updateProject(1L, new Project()));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("cannot be modified"));
    }

    @Test
    void shouldUpdateProjectAndValidateChangedActors() {
        Project existing = project(ProjectStatus.DRAFT, 1L, 2L);
        existing.setTitle("old");
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userServiceClient.getUserById(3L)).thenReturn(user(3L, "CLIENT"));
        when(userServiceClient.getUserById(4L)).thenReturn(user(4L, "FREELANCER"));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project updated = new Project();
        updated.setTitle("new title");
        updated.setDescription("new desc");
        updated.setBudget(200.0);
        updated.setClientId(3L);
        updated.setFreelancerId(4L);

        Project result = service.updateProject(1L, updated);

        assertEquals("new title", result.getTitle());
        assertEquals(3L, result.getClientId());
        assertEquals(4L, result.getFreelancerId());
    }

    @Test
    void shouldCreateProjectAndSetDraftStatus() {
        Project toCreate = new Project();
        toCreate.setClientId(1L);
        toCreate.setFreelancerId(2L);
        when(userServiceClient.getUserById(1L)).thenReturn(user(1L, "CLIENT"));
        when(userServiceClient.getUserById(2L)).thenReturn(user(2L, "FREELANCER"));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project result = service.createProject(toCreate);

        assertEquals(ProjectStatus.DRAFT, result.getStatus());
        verify(projectRepository).save(toCreate);
    }

    private Project project(ProjectStatus status, Long clientId, Long freelancerId) {
        Project project = new Project();
        project.setStatus(status);
        project.setClientId(clientId);
        project.setFreelancerId(freelancerId);
        return project;
    }

    private CondidatureExternalDTO candidature(String status, Long freelancerId) {
        CondidatureExternalDTO candidature = new CondidatureExternalDTO();
        candidature.setStatus(status);
        candidature.setFreelancerId(freelancerId);
        return candidature;
    }

    private UserExternalDTO user(Long id, String role) {
        UserExternalDTO user = new UserExternalDTO();
        user.setId(id);
        user.setRole(role);
        return user;
    }
}
