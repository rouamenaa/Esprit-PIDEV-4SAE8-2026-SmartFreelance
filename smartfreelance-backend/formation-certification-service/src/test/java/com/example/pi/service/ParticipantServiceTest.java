package com.example.pi.service;

import com.example.pi.client.CalendarClient;
import com.example.pi.dto.ParticipantRequestDTO;
import com.example.pi.dto.ParticipantResponseDTO;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParticipantServiceTest {

    @Mock
    private ParticipantRepository participantRepo;

    @Mock
    private FormationRepository formationRepo;

    @Mock
    private CalendarClient calendarClient;

    @InjectMocks
    private ParticipantService participantService;

    private Formation formation;

    @BeforeEach
    void setUp() {
        formation = new Formation();
        formation.setId(1L);
        formation.setStartDate(LocalDate.now().plusDays(10));
        formation.setEndDate(LocalDate.now().plusDays(20));
        formation.setMaxParticipants(10);
        formation.setPrice(BigDecimal.valueOf(100));
    }

    // ─────────────────────────────
    // Helpers
    // ─────────────────────────────

    private void mockSave() {
        when(participantRepo.save(any(Participant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private Participant buildParticipant() {
        Participant p = new Participant();
        p.setId(1L);
        p.setFullName("John");
        p.setEmail("john@test.com");
        p.setStatus(ParticipantStatus.REGISTERED);
        p.setRegistrationDate(LocalDate.now());
        p.setFormation(formation);
        return p;
    }

    // ─────────────────────────────
    // REGISTER
    // ─────────────────────────────

    @Test
    void shouldRegisterParticipantSuccessfully() {

        ParticipantRequestDTO dto = new ParticipantRequestDTO();
        dto.setFullName("John Doe");
        dto.setEmail("john@test.com");

        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED)).thenReturn(0L);
        when(participantRepo.findByFormationIdAndEmail(1L, dto.getEmail())).thenReturn(Optional.empty());
        when(calendarClient.syncRegistration(1L, dto.getEmail())).thenReturn("SYNCED");

        mockSave();

        ParticipantResponseDTO response = participantService.registerParticipant(1L, dto);

        assertAll(
                () -> assertNotNull(response),
                () -> assertEquals("John Doe", response.getFullName()),
                () -> assertEquals("SYNCED", response.getCalendarSyncStatus())
        );
    }

    @Test
    void shouldThrowIfFormationNotFound() {
        when(formationRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> participantService.registerParticipant(1L, new ParticipantRequestDTO()));
    }

    @Test
    void shouldThrowIfFormationIsFull() {
        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED)).thenReturn(10L);

        ParticipantRequestDTO dto = new ParticipantRequestDTO();
        dto.setEmail("test@mail.com");

        assertThrows(BusinessException.class,
                () -> participantService.registerParticipant(1L, dto));
    }

    @Test
    void shouldThrowIfDuplicateEmail() {
        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED)).thenReturn(0L);
        when(participantRepo.findByFormationIdAndEmail(1L, "test@mail.com"))
                .thenReturn(Optional.of(new Participant()));

        ParticipantRequestDTO dto = new ParticipantRequestDTO();
        dto.setEmail("test@mail.com");

        assertThrows(BusinessException.class,
                () -> participantService.registerParticipant(1L, dto));
    }

    // ─────────────────────────────
    // CANCEL
    // ─────────────────────────────

    @Test
    void shouldCancelRegistration() {

        Participant p = buildParticipant();

        when(participantRepo.findById(1L)).thenReturn(Optional.of(p));
        mockSave();

        ParticipantResponseDTO response = participantService.cancelRegistration(1L, 1L);

        assertEquals("CANCELLED", response.getStatus());
    }

    @Test
    void shouldThrowIfParticipantNotFound() {
        when(participantRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> participantService.cancelRegistration(1L, 1L));
    }

    // ─────────────────────────────
    // LIST
    // ─────────────────────────────

    @Test
    void shouldReturnParticipantsByFormation() {

        Participant p = buildParticipant();

        when(formationRepo.existsById(1L)).thenReturn(true);
        when(participantRepo.findByFormationId(1L)).thenReturn(List.of(p));

        List<ParticipantResponseDTO> result =
                participantService.getParticipantsByFormation(1L);

        assertEquals(1, result.size());
    }

    // ─────────────────────────────
    // PRICE
    // ─────────────────────────────

    @Test
    void shouldApplyEarlyBirdDiscount() {

        formation.setStartDate(LocalDate.now().plusDays(40));

        BigDecimal price = participantService.computeDynamicPrice(formation);

        assertEquals(
                BigDecimal.valueOf(80.00).setScale(2),
                price
        );
    }

    @Test
    void shouldApplySurgePricing() {

        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED))
                .thenReturn(8L);

        BigDecimal price = participantService.computeDynamicPrice(formation);

        assertEquals(
                BigDecimal.valueOf(115.00).setScale(2),
                price
        );
    }

    // ─────────────────────────────
    // STATUS
    // ─────────────────────────────

    @Test
    void shouldReturnUpcomingStatus() {
        formation.setStartDate(LocalDate.now().plusDays(5));

        assertEquals("UPCOMING",
                participantService.computeDynamicStatus(formation));
    }

    @Test
    void shouldReturnOngoingStatus() {
        formation.setStartDate(LocalDate.now().minusDays(1));
        formation.setEndDate(LocalDate.now().plusDays(5));

        assertEquals("ONGOING",
                participantService.computeDynamicStatus(formation));
    }

    @Test
    void shouldReturnFinishedStatus() {
        formation.setStartDate(LocalDate.now().minusDays(10));
        formation.setEndDate(LocalDate.now().minusDays(1));

        assertEquals("FINISHED",
                participantService.computeDynamicStatus(formation));
    }
}