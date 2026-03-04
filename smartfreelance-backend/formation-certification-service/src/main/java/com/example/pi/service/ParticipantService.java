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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepo;
    private final FormationRepository formationRepo;
    private final CalendarClient calendarClient;

    public ParticipantService(ParticipantRepository participantRepo,
                              FormationRepository formationRepo,
                              CalendarClient calendarClient) {
        this.participantRepo = participantRepo;
        this.formationRepo = formationRepo;
        this.calendarClient = calendarClient;
    }

    // ─── Register ────────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponseDTO registerParticipant(Long formationId, ParticipantRequestDTO dto) {
        Formation formation = formationRepo.findById(formationId)
                .orElseThrow(() -> new BusinessException("Formation not found: " + formationId, HttpStatus.NOT_FOUND));

        LocalDate today = LocalDate.now();

        // Guard: formation already started
        if (formation.getStartDate() != null && !today.isBefore(formation.getStartDate())) {
            throw new BusinessException("Registration is closed: the formation has already started.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // Guard: formation is full
        long registered = participantRepo.countByFormationIdAndStatus(formationId, ParticipantStatus.REGISTERED);
        if (formation.getMaxParticipants() != null && registered >= formation.getMaxParticipants()) {
            throw new BusinessException("Formation is full.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // Guard: duplicate email for this formation
        participantRepo.findByFormationIdAndEmail(formationId, dto.getEmail()).ifPresent(p -> {
            throw new BusinessException("This email is already registered for this formation.", HttpStatus.CONFLICT);
        });

        // Persist
        Participant participant = new Participant();
        participant.setFullName(dto.getFullName());
        participant.setEmail(dto.getEmail());
        participant.setRegistrationDate(today);
        participant.setStatus(ParticipantStatus.REGISTERED);
        participant.setFormation(formation);
        participant = participantRepo.save(participant);

        // Calendar sync (non-blocking: never rolls back registration)
        String calendarSyncStatus = calendarClient.syncRegistration(formationId, dto.getEmail());

        return toResponseDTO(participant, calendarSyncStatus);
    }

    // ─── Cancel ──────────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponseDTO cancelRegistration(Long formationId, Long participantId) {
        Participant participant = participantRepo.findById(participantId)
                .orElseThrow(() -> new BusinessException("Participant not found: " + participantId, HttpStatus.NOT_FOUND));

        if (!participant.getFormation().getId().equals(formationId)) {
            throw new BusinessException("Participant does not belong to this formation.", HttpStatus.BAD_REQUEST);
        }

        Formation formation = participant.getFormation();
        LocalDate today = LocalDate.now();

        // Guard: formation already started
        if (formation.getStartDate() != null && !today.isBefore(formation.getStartDate())) {
            throw new BusinessException("Cancellation is not allowed: the formation has already started.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        if (participant.getStatus() == ParticipantStatus.CANCELLED) {
            throw new BusinessException("Registration is already cancelled.", HttpStatus.CONFLICT);
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        participant = participantRepo.save(participant);
        return toResponseDTO(participant, null);
    }

    // ─── List ─────────────────────────────────────────────────────────────────────

    public List<ParticipantResponseDTO> getParticipantsByFormation(Long formationId) {
        if (!formationRepo.existsById(formationId)) {
            throw new BusinessException("Formation not found: " + formationId, HttpStatus.NOT_FOUND);
        }
        return participantRepo.findByFormationId(formationId).stream()
                .map(p -> toResponseDTO(p, null))
                .collect(Collectors.toList());
    }

    // ─── Dynamic Price ─────────────────────────────────────────────────────────────

    /**
     * Computes dynamic price:
     * - −20% if registration is ≥ 30 days before start date
     * - +15% if ≥ 80% capacity is reached
     * Rules are cumulative.
     */
    public BigDecimal computeDynamicPrice(Formation formation) {
        if (formation.getPrice() == null) return null;

        BigDecimal price = formation.getPrice();
        LocalDate today = LocalDate.now();

        // Early-bird discount
        if (formation.getStartDate() != null) {
            long daysUntilStart = ChronoUnit.DAYS.between(today, formation.getStartDate());
            if (daysUntilStart >= 30) {
                price = price.multiply(BigDecimal.valueOf(0.80));
            }
        }

        // Surge pricing
        if (formation.getMaxParticipants() != null && formation.getMaxParticipants() > 0) {
            long registered = participantRepo.countByFormationIdAndStatus(formation.getId(), ParticipantStatus.REGISTERED);
            double fillRate = (double) registered / formation.getMaxParticipants();
            if (fillRate >= 0.80) {
                price = price.multiply(BigDecimal.valueOf(1.15));
            }
        }

        return price.setScale(2, RoundingMode.HALF_UP);
    }

    // ─── Dynamic Status ────────────────────────────────────────────────────────────

    /**
     * Computes dynamic status: UPCOMING / ONGOING / FINISHED.
     */
    public String computeDynamicStatus(Formation formation) {
        LocalDate today = LocalDate.now();
        if (formation.getStartDate() == null) return "UPCOMING";
        if (today.isBefore(formation.getStartDate())) return "UPCOMING";
        if (formation.getEndDate() != null && today.isAfter(formation.getEndDate())) return "FINISHED";
        return "ONGOING";
    }

    // ─── Mapper ────────────────────────────────────────────────────────────────────

    private ParticipantResponseDTO toResponseDTO(Participant p, String syncStatus) {
        ParticipantResponseDTO dto = new ParticipantResponseDTO();
        dto.setId(p.getId());
        dto.setFullName(p.getFullName());
        dto.setEmail(p.getEmail());
        dto.setRegistrationDate(p.getRegistrationDate());
        dto.setStatus(p.getStatus().name());
        dto.setCalendarSyncStatus(syncStatus);
        return dto;
    }
}
