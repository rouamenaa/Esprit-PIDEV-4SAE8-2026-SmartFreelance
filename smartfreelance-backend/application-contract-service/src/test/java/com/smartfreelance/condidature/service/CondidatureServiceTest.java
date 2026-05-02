package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.client.ProjectServiceClient;
import com.smartfreelance.condidature.dto.AssignFreelancerRequestDTO;
import com.smartfreelance.condidature.dto.CondidatureDetailStatsDTO;
import com.smartfreelance.condidature.dto.CondidatureDTO;
import com.smartfreelance.condidature.dto.CondidatureRequestDTO;
import com.smartfreelance.condidature.model.Condidature;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import com.smartfreelance.condidature.repository.CondidatureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CondidatureServiceTest {

    @Mock
    private CondidatureRepository condidatureRepository;

    @Mock
    private ProjectServiceClient projectServiceClient;

    @InjectMocks
    private CondidatureService condidatureService;

    private CondidatureRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        validRequest = CondidatureRequestDTO.builder()
                .projectId(11L)
                .freelancerId(22L)
                .coverLetter("Experienced Java freelancer")
                .proposedPrice(900.0)
                .estimatedDeliveryDays(12)
                .freelancerRating(4.5)
                .build();
    }

    @Test
    void createSetsPendingStatusByDefault() {
        when(condidatureRepository.findByProjectIdAndFreelancerId(11L, 22L)).thenReturn(Optional.empty());
        when(condidatureRepository.existsByFreelancerIdAndStatus(22L, CondidatureStatus.ACCEPTED)).thenReturn(false);
        when(condidatureRepository.existsByProjectIdAndFreelancerId(11L, 22L)).thenReturn(false);
        when(condidatureRepository.save(any(Condidature.class))).thenAnswer(invocation -> {
            Condidature c = invocation.getArgument(0);
            c.setId(100L);
            return c;
        });

        CondidatureDTO created = condidatureService.create(validRequest);

        assertEquals(100L, created.getId());
        assertEquals(CondidatureStatus.PENDING, created.getStatus());
    }

    @Test
    void createThrowsWhenPendingOrAcceptedAlreadyExists() {
        Condidature existing = Condidature.builder()
                .id(1L)
                .projectId(11L)
                .freelancerId(22L)
                .status(CondidatureStatus.PENDING)
                .build();
        when(condidatureRepository.findByProjectIdAndFreelancerId(11L, 22L))
                .thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> condidatureService.create(validRequest));
        assertEquals("A condidature already exists for this project and freelancer.", ex.getMessage());
    }

    @Test
    void acceptAssignsFreelancerRejectsOthersAndDeletesOtherProjects() {
        Condidature accepted = Condidature.builder()
                .id(1L)
                .projectId(10L)
                .freelancerId(20L)
                .status(CondidatureStatus.PENDING)
                .build();
        Condidature sameProjectPending = Condidature.builder()
                .id(2L)
                .projectId(10L)
                .freelancerId(30L)
                .status(CondidatureStatus.PENDING)
                .build();
        Condidature sameProjectRejected = Condidature.builder()
                .id(3L)
                .projectId(10L)
                .freelancerId(31L)
                .status(CondidatureStatus.REJECTED)
                .build();
        Condidature otherProject = Condidature.builder()
                .id(4L)
                .projectId(99L)
                .freelancerId(20L)
                .status(CondidatureStatus.PENDING)
                .build();

        when(condidatureRepository.findById(1L)).thenReturn(Optional.of(accepted));
        when(condidatureRepository.findByProjectId(10L)).thenReturn(List.of(accepted, sameProjectPending, sameProjectRejected));
        when(condidatureRepository.findByFreelancerId(20L)).thenReturn(List.of(accepted, otherProject));
        when(condidatureRepository.save(any(Condidature.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(projectServiceClient).assignFreelancer(eq(10L), any(AssignFreelancerRequestDTO.class));

        CondidatureDTO result = condidatureService.accept(1L);

        assertEquals(CondidatureStatus.ACCEPTED, result.getStatus());
        assertEquals(CondidatureStatus.REJECTED, sameProjectPending.getStatus());
        verify(condidatureRepository).delete(otherProject);

        ArgumentCaptor<AssignFreelancerRequestDTO> captor = ArgumentCaptor.forClass(AssignFreelancerRequestDTO.class);
        verify(projectServiceClient).assignFreelancer(eq(10L), captor.capture());
        assertEquals(20L, captor.getValue().getFreelancerId());
    }

    @Test
    void getCondidatureDetailStatisticsAggregatesProjectAndFreelancerData() {
        Condidature target = Condidature.builder()
                .id(5L)
                .projectId(50L)
                .freelancerId(60L)
                .status(CondidatureStatus.PENDING)
                .freelancerRating(4.0)
                .build();

        when(condidatureRepository.findById(5L)).thenReturn(Optional.of(target));
        when(condidatureRepository.findByProjectId(50L)).thenReturn(List.of(
                target,
                Condidature.builder().id(6L).projectId(50L).freelancerId(61L).status(CondidatureStatus.ACCEPTED).build()
        ));
        when(condidatureRepository.findByFreelancerId(60L)).thenReturn(List.of(
                target,
                Condidature.builder().id(7L).projectId(51L).freelancerId(60L).status(CondidatureStatus.REJECTED).freelancerRating(2.0).build()
        ));

        CondidatureDetailStatsDTO stats = condidatureService.getCondidatureDetailStatistics(5L);

        assertNotNull(stats);
        assertEquals(2, stats.getProjectApplicationsCount());
        assertEquals(1, stats.getProjectAcceptedCount());
        assertEquals(2, stats.getFreelancerTotalApplications());
        assertEquals(3.0, stats.getFreelancerAverageRating());
    }

    @Test
    void deleteByIdThrowsWhenMissing() {
        when(condidatureRepository.existsById(123L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> condidatureService.deleteById(123L));
        verify(condidatureRepository, never()).deleteById(any());
    }
}
