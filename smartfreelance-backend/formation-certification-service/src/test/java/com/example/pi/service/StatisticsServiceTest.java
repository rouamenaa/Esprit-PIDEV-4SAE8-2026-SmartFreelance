package com.example.pi.service;

import com.example.pi.dto.FormationStatisticsDTO;
import com.example.pi.dto.GlobalStatisticsDTO;
import com.example.pi.dto.MonthlyRegistrationDTO;
import com.example.pi.entity.Formation;
import com.example.pi.entity.Participant;
import com.example.pi.entity.ParticipantStatus;
import com.example.pi.exception.BusinessException;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.ParticipantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @Mock
    private FormationRepository formationRepo;

    @Mock
    private ParticipantRepository participantRepo;

    @Mock
    private ParticipantService participantService;

    @InjectMocks
    private StatisticsService service;

    private Formation formation;

    @BeforeEach
    void setUp() {
        formation = new Formation();
        formation.setId(1L);
        formation.setTitle("Java");
        formation.setMaxParticipants(10);
        formation.setPrice(BigDecimal.valueOf(100));
    }

    // ───────────────────────────── GLOBAL STATS ─────────────────────────────

    @Test
    void shouldReturnGlobalStatistics() {

        when(formationRepo.count()).thenReturn(2L);

        Participant p = new Participant();
        p.setStatus(ParticipantStatus.REGISTERED);

        when(participantRepo.findAll()).thenReturn(List.of(p));

        List<Object[]> mockCategories = new ArrayList<>();
        mockCategories.add(new Object[]{"DEV", 5L});

        when(participantRepo.countByCategory()).thenReturn(mockCategories);

        GlobalStatisticsDTO result = service.getGlobalStatistics();

        assertNotNull(result);
        assertEquals(2L, result.getTotalFormations());
        assertEquals(1L, result.getTotalParticipants());
        assertEquals("DEV", result.getMostPopularCategory());
    }


    // ───────────────────────────── FORMATION STATS ─────────────────────────────

    @Test
    void shouldReturnFormationStatistics() {

        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED))
                .thenReturn(6L);
        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.CANCELLED))
                .thenReturn(1L);
        when(participantService.computeDynamicStatus(formation))
                .thenReturn("ONGOING");

        FormationStatisticsDTO result = service.getFormationStatistics(1L);

        assertNotNull(result);
        assertEquals(1L, result.getFormationId());
        assertEquals("Java", result.getTitle());
        assertEquals(6L, result.getRegisteredCount());
        assertEquals(1L, result.getCancelledCount());
        assertEquals("ONGOING", result.getFormationStatus());
    }

    @Test
    void shouldThrowIfFormationNotFound() {

        when(formationRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> service.getFormationStatistics(1L));
    }

    // ───────────────────────────── MONTHLY STATS ─────────────────────────────

    @Test
    void shouldReturnMonthlyRegistrations() {

        when(participantRepo.countByMonth())
                .thenReturn(List.of(
                        new Object[]{"2026-01", 5L},
                        new Object[]{"2026-02", 10L}
                ));

        List<MonthlyRegistrationDTO> result = service.getMonthlyRegistrations();

        assertEquals(2, result.size());
        assertEquals("2026-01", result.get(0).getMonth());
        assertEquals(5L, result.get(0).getCount());
    }
}