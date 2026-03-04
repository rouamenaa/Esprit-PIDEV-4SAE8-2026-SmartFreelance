package com.example.pi.service;

import com.example.pi.dto.FormationStatisticsDTO;
import com.example.pi.dto.GlobalStatisticsDTO;
import com.example.pi.dto.MonthlyRegistrationDTO;
import com.example.pi.entity.Formation;
import com.example.pi.entity.ParticipantStatus;
import com.example.pi.exception.BusinessException;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.ParticipantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final FormationRepository formationRepo;
    private final ParticipantRepository participantRepo;
    private final ParticipantService participantService;

    public StatisticsService(FormationRepository formationRepo,
                             ParticipantRepository participantRepo,
                             ParticipantService participantService) {
        this.formationRepo = formationRepo;
        this.participantRepo = participantRepo;
        this.participantService = participantService;
    }

    // ─── Global Statistics ────────────────────────────────────────────────────────

    public GlobalStatisticsDTO getGlobalStatistics() {
        GlobalStatisticsDTO dto = new GlobalStatisticsDTO();

        long totalFormations = formationRepo.count();
        dto.setTotalFormations(totalFormations);

        long totalParticipants = participantRepo.countByFormationIdAndStatus(
                null, ParticipantStatus.REGISTERED); // won't work for null id
        // Use direct count
        long total = participantRepo.findAll().stream()
                .filter(p -> p.getStatus() == ParticipantStatus.REGISTERED)
                .count();
        dto.setTotalParticipants(total);

        // Average price of formations that have a price
        BigDecimal avgPrice = formationRepo.findAll().stream()
                .filter(f -> f.getPrice() != null)
                .map(Formation::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pricedCount = formationRepo.findAll().stream()
                .filter(f -> f.getPrice() != null).count();

        dto.setAveragePrice(pricedCount > 0
                ? avgPrice.divide(BigDecimal.valueOf(pricedCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        // Most popular category (by number of REGISTERED participants)
        List<Object[]> categories = participantRepo.countByCategory();
        dto.setMostPopularCategory(categories.isEmpty() ? "N/A" : (String) categories.get(0)[0]);

        return dto;
    }

    // ─── Formation-level Statistics ───────────────────────────────────────────────

    public FormationStatisticsDTO getFormationStatistics(Long formationId) {
        Formation formation = formationRepo.findById(formationId)
                .orElseThrow(() -> new BusinessException("Formation not found: " + formationId, HttpStatus.NOT_FOUND));

        long registered = participantRepo.countByFormationIdAndStatus(formationId, ParticipantStatus.REGISTERED);
        long cancelled  = participantRepo.countByFormationIdAndStatus(formationId, ParticipantStatus.CANCELLED);
        int maxSeats = formation.getMaxParticipants() != null ? formation.getMaxParticipants() : 0;
        int remaining = Math.max(0, maxSeats - (int) registered);
        double fillRate = maxSeats > 0 ? (double) registered / maxSeats * 100.0 : 0.0;

        FormationStatisticsDTO dto = new FormationStatisticsDTO();
        dto.setFormationId(formationId);
        dto.setTitle(formation.getTitle());
        dto.setRegisteredCount(registered);
        dto.setCancelledCount(cancelled);
        dto.setRemainingSeats(remaining);
        dto.setFillRate(Math.round(fillRate * 100.0) / 100.0);
        dto.setFormationStatus(participantService.computeDynamicStatus(formation));
        return dto;
    }

    // ─── Monthly Registrations ────────────────────────────────────────────────────

    public List<MonthlyRegistrationDTO> getMonthlyRegistrations() {
        return participantRepo.countByMonth().stream()
                .map(row -> new MonthlyRegistrationDTO((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }
}
