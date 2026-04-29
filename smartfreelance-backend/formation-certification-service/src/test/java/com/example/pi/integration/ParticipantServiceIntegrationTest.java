package com.example.pi.integration;

import com.example.pi.client.CalendarClient;
import com.example.pi.dto.ParticipantRequestDTO;
import com.example.pi.entity.Formation;
import com.example.pi.entity.Participant;
import com.example.pi.entity.ParticipantStatus;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.ParticipantRepository;
import com.example.pi.service.ParticipantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class ParticipantServiceIntegrationTest {

    @Autowired
    private ParticipantService participantService;

    @MockBean
    private ParticipantRepository participantRepo;

    @MockBean
    private FormationRepository formationRepo;

    @MockBean
    private CalendarClient calendarClient;

    // ---------------- REGISTER ----------------
    @Test
    void register_shouldCreateParticipant() {
        Formation f = new Formation();
        f.setId(1L);
        f.setMaxParticipants(10);
        f.setStartDate(LocalDate.now().plusDays(10));

        when(formationRepo.findById(1L))
                .thenReturn(Optional.of(f));

        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED))
                .thenReturn(2L);

        when(participantRepo.findByFormationIdAndEmail(anyLong(), anyString()))
                .thenReturn(Optional.empty());

        when(participantRepo.save(any(Participant.class)))
                .thenAnswer(i -> i.getArgument(0));

        when(calendarClient.syncRegistration(anyLong(), anyString()))
                .thenReturn("SYNCED");

        ParticipantRequestDTO dto = new ParticipantRequestDTO();
        dto.setFullName("John Doe");
        dto.setEmail("john@test.com");

        var result = participantService.registerParticipant(1L, dto);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        assertEquals("REGISTERED", result.getStatus());
    }

    // ---------------- CANCEL ----------------
    @Test
    void cancel_shouldUpdateStatus() {
        Formation f = new Formation();
        f.setId(1L);
        f.setStartDate(LocalDate.now().plusDays(10));

        Participant p = new Participant();
        p.setId(1L);
        p.setEmail("test@test.com");
        p.setStatus(ParticipantStatus.REGISTERED);
        p.setFormation(f);

        when(participantRepo.findById(1L))
                .thenReturn(Optional.of(p));

        when(participantRepo.save(any(Participant.class)))
                .thenAnswer(i -> i.getArgument(0));

        var result = participantService.cancelRegistration(1L, 1L);

        assertEquals("CANCELLED", result.getStatus());
    }

    // ---------------- GET BY FORMATION ----------------
    @Test
    void getByFormation_shouldReturnList() {
        Formation f = new Formation();
        f.setId(1L);

        when(formationRepo.existsById(1L)).thenReturn(true);

        Participant p = new Participant();
        p.setId(1L);
        p.setEmail("test@test.com");
        p.setFullName("User");
        p.setStatus(ParticipantStatus.REGISTERED);   // ← AJOUTÉ

        when(participantRepo.findByFormationId(1L))
                .thenReturn(List.of(p));

        var result = participantService.getParticipantsByFormation(1L);

        assertEquals(1, result.size());
    }

    // ---------------- COMPUTE PRICE ----------------
    @Test
    void computeDynamicPrice_shouldApplyDiscount() {
        Formation f = new Formation();
        f.setId(1L);
        f.setPrice(BigDecimal.valueOf(100));
        f.setMaxParticipants(10);
        f.setStartDate(LocalDate.now().plusDays(40));

        when(participantRepo.countByFormationIdAndStatus(1L, ParticipantStatus.REGISTERED))
                .thenReturn(9L);

        BigDecimal price = participantService.computeDynamicPrice(f);

        assertNotNull(price);
        assertTrue(price.compareTo(BigDecimal.ZERO) > 0);
    }

    // ---------------- COMPUTE STATUS ----------------
    @Test
    void computeStatus_shouldReturnUpcoming() {
        Formation f = new Formation();
        f.setStartDate(LocalDate.now().plusDays(5));
        f.setEndDate(LocalDate.now().plusDays(10));

        String status = participantService.computeDynamicStatus(f);

        assertEquals("UPCOMING", status);
    }
}