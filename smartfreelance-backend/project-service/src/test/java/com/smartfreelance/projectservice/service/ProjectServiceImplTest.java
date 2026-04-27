package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.client.ApplicationContractClient;
import com.smartfreelance.projectservice.client.UserServiceClient;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

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
        service = new ProjectServiceImpl(projectRepository);
    }

    @Test
    void shouldApproveProjectSuccessfully() {
        Project project = new Project();
        project.setStatus(ProjectStatus.DRAFT);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project result = service.approveProject(1L);

        assertEquals(ProjectStatus.APPROVED, result.getStatus());
    }

    @Test
    void shouldThrowWhenStartingNonApprovedProject() {
        Project project = new Project();
        project.setStatus(ProjectStatus.DRAFT);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.startProject(1L));

        assertTrue(ex.getMessage().contains("Only APPROVED projects can be started"));
    }
}