package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.dto.ApplicationsPerProjectDTO;
import com.smartfreelance.condidature.dto.CondidatureDetailStatsDTO;
import com.smartfreelance.condidature.dto.CondidatureDTO;
import com.smartfreelance.condidature.dto.CondidatureRequestDTO;
import com.smartfreelance.condidature.dto.CondidatureStatsDTO;
import com.smartfreelance.condidature.dto.FreelancerSuccessRateDTO;
import com.smartfreelance.condidature.model.Condidature;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import com.smartfreelance.condidature.repository.CondidatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CondidatureService {

    private final CondidatureRepository condidatureRepository;

    public List<CondidatureDTO> findAll() {
        return condidatureRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CondidatureDTO findById(Long id) {
        Objects.requireNonNull(id, "id");
        Condidature entity = condidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condidature not found with id: " + id));
        return toDTO(entity);
    }

    public List<CondidatureDTO> findByProjectId(Long projectId) {
        return condidatureRepository.findByProjectId(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CondidatureDTO> findByFreelancerId(Long freelancerId) {
        return condidatureRepository.findByFreelancerId(freelancerId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CondidatureDTO> findByProjectIdAndStatus(Long projectId, CondidatureStatus status) {
        return condidatureRepository.findByProjectIdAndStatus(projectId, status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns candidatures for the project sorted by auto-ranking score (best first).
     * Ranking uses: freelancer rating (higher better), proposed budget (lower better),
     * cover letter quality (longer better), estimated delivery days (fewer better).
     */
    public List<CondidatureDTO> findRankedByProjectId(Long projectId) {
        List<Condidature> list = condidatureRepository.findByProjectId(projectId);
        return rankAndToDTO(list);
    }

    /**
     * Returns all candidatures sorted by auto-ranking score (best first).
     */
    public List<CondidatureDTO> findAllRanked() {
        List<Condidature> list = condidatureRepository.findAll();
        return rankAndToDTO(list);
    }

    private List<CondidatureDTO> rankAndToDTO(List<Condidature> list) {
        if (list.isEmpty()) return List.of();

        double minPrice = list.stream()
                .map(Condidature::getProposedPrice)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .min().orElse(0);
        double maxPrice = list.stream()
                .map(Condidature::getProposedPrice)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .max().orElse(1);
        double priceRange = maxPrice - minPrice;
        if (priceRange <= 0) priceRange = 1;

        int minDays = list.stream()
                .map(Condidature::getEstimatedDeliveryDays)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .min().orElse(0);
        int maxDays = list.stream()
                .map(Condidature::getEstimatedDeliveryDays)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max().orElse(1);
        int daysRange = maxDays - minDays;
        if (daysRange <= 0) daysRange = 1;

        final double prMin = minPrice, prMax = maxPrice, prRange = priceRange;
        final int dMin = minDays, dMax = maxDays, dRange = daysRange;

        return list.stream()
                .sorted(Comparator.comparingDouble((Condidature c) -> computeRankScore(c, prMin, prMax, prRange, dMin, dMax, dRange)).reversed())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Score 0–1: higher = better. Weights: rating 0.3, budget 0.3, cover letter 0.2, delivery days 0.2. */
    private double computeRankScore(Condidature c, double minPrice, double maxPrice, double priceRange,
                                    int minDays, int maxDays, int daysRange) {
        double ratingScore = c.getFreelancerRating() != null
                ? Math.min(1, Math.max(0, c.getFreelancerRating() / 5.0))
                : 0.5;
        double price = c.getProposedPrice() != null ? c.getProposedPrice() : (minPrice + maxPrice) / 2;
        double budgetScore = (maxPrice - price) / priceRange;
        int len = c.getCoverLetter() != null ? c.getCoverLetter().length() : 0;
        double coverScore = Math.min(1.0, len / 400.0);
        int days = c.getEstimatedDeliveryDays() != null ? c.getEstimatedDeliveryDays() : (minDays + maxDays) / 2;
        double daysScore = (double) (maxDays - days) / daysRange;
        return 0.3 * ratingScore + 0.3 * budgetScore + 0.2 * coverScore + 0.2 * daysScore;
    }

    @Transactional
    public CondidatureDTO create(CondidatureRequestDTO dto) {
        Objects.requireNonNull(dto, "dto");
        if (condidatureRepository.existsByProjectIdAndFreelancerId(dto.getProjectId(), dto.getFreelancerId())) {
            throw new IllegalArgumentException("A condidature already exists for this project and freelancer.");
        }
        Condidature entity = toEntity(dto);
        if (dto.getStatus() == null) {
            entity.setStatus(CondidatureStatus.PENDING);
        }
        return toDTO(condidatureRepository.save(entity));
    }

    @Transactional
    public CondidatureDTO update(Long id, CondidatureRequestDTO dto) {
        Objects.requireNonNull(id, "id");
        Condidature entity = condidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condidature not found with id: " + id));
        entity.setCoverLetter(dto.getCoverLetter());
        entity.setProposedPrice(dto.getProposedPrice());
        entity.setEstimatedDeliveryDays(dto.getEstimatedDeliveryDays());
        entity.setFreelancerRating(dto.getFreelancerRating());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        return toDTO(condidatureRepository.save(entity));
    }

    @Transactional
    public void deleteById(Long id) {
        Objects.requireNonNull(id, "id");
        if (!condidatureRepository.existsById(id)) {
            throw new ResourceNotFoundException("Condidature not found with id: " + id);
        }
        condidatureRepository.deleteById(id);
    }

    /**
     * Accept a candidature (client side): set status to ACCEPTED and reject all other
     * candidatures for the same project.
     */
    @Transactional
    public CondidatureDTO accept(Long id) {
        Objects.requireNonNull(id, "id");
        Condidature accepted = condidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condidature not found with id: " + id));
        if (accepted.getStatus() == CondidatureStatus.ACCEPTED) {
            return toDTO(accepted);
        }
        accepted.setStatus(CondidatureStatus.ACCEPTED);
        condidatureRepository.save(accepted);

        Long projectId = accepted.getProjectId();
        List<Condidature> others = condidatureRepository.findByProjectId(projectId).stream()
                .filter(c -> !c.getId().equals(id) && c.getStatus() == CondidatureStatus.PENDING)
                .collect(Collectors.toList());
        for (Condidature c : others) {
            c.setStatus(CondidatureStatus.REJECTED);
            condidatureRepository.save(c);
        }

        return toDTO(accepted);
    }

    /**
     * Statistics for admin dashboard:
     * - Applications per project: total count of candidatures per project_id in database.
     * - Acceptance rate: from status column (PENDING/REJECTED/WITHDRAWN/ACCEPTED) = ACCEPTED / total.
     * - Freelancer success rate: from freelancer_rating data (average rating 0–5 → 0–100%).
     */
    public CondidatureStatsDTO getStatistics() {
        List<Condidature> all = condidatureRepository.findAll();
        long total = all.size();
        long accepted = all.stream()
                .filter(c -> c.getStatus() == CondidatureStatus.ACCEPTED)
                .count();
        double acceptanceRate = total > 0 ? (accepted * 100.0 / total) : 0.0;

        /* Number of applications per project = count by project_id */
        Map<Long, Long> perProject = all.stream()
                .collect(Collectors.groupingBy(Condidature::getProjectId, Collectors.counting()));
        List<ApplicationsPerProjectDTO> applicationsPerProject = perProject.entrySet().stream()
                .map(e -> ApplicationsPerProjectDTO.builder()
                        .projectId(e.getKey())
                        .count(e.getValue())
                        .build())
                .sorted(Comparator.comparing(ApplicationsPerProjectDTO::getProjectId))
                .collect(Collectors.toList());

        Map<Long, List<Condidature>> byFreelancer = all.stream()
                .collect(Collectors.groupingBy(Condidature::getFreelancerId));
        /* Freelancer success rate from freelancer_rating (average 0–5 → success % 0–100) */
        List<FreelancerSuccessRateDTO> freelancerSuccessRates = byFreelancer.entrySet().stream()
                .map(e -> {
                    List<Condidature> list = e.getValue();
                    long totalApps = list.size();
                    double sumRating = list.stream()
                            .map(Condidature::getFreelancerRating)
                            .filter(java.util.Objects::nonNull)
                            .mapToDouble(Double::doubleValue)
                            .sum();
                    long countWithRating = list.stream()
                            .map(Condidature::getFreelancerRating)
                            .filter(java.util.Objects::nonNull)
                            .count();
                    double averageRating = countWithRating > 0 ? (sumRating / countWithRating) : 0.0;
                    double successRatePercent = (averageRating / 5.0) * 100.0;
                    return FreelancerSuccessRateDTO.builder()
                            .freelancerId(e.getKey())
                            .totalApplications(totalApps)
                            .averageRating(averageRating)
                            .successRatePercent(successRatePercent)
                            .build();
                })
                .sorted(Comparator.comparing(FreelancerSuccessRateDTO::getFreelancerId))
                .collect(Collectors.toList());

        return CondidatureStatsDTO.builder()
                .totalApplications(total)
                .acceptedCount(accepted)
                .acceptanceRatePercent(acceptanceRate)
                .applicationsPerProject(applicationsPerProject)
                .freelancerSuccessRates(freelancerSuccessRates)
                .build();
    }

    /**
     * Statistics related to a single candidature: for its project and freelancer.
     * Used in the candidature details view.
     */
    public CondidatureDetailStatsDTO getCondidatureDetailStatistics(Long id) {
        Objects.requireNonNull(id, "id");
        Condidature c = condidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condidature not found with id: " + id));
        Long projectId = c.getProjectId();
        Long freelancerId = c.getFreelancerId();

        List<Condidature> forProject = condidatureRepository.findByProjectId(projectId);
        long projectTotal = forProject.size();
        long projectAccepted = forProject.stream()
                .filter(x -> x.getStatus() == CondidatureStatus.ACCEPTED)
                .count();
        double projectRate = projectTotal > 0 ? (projectAccepted * 100.0 / projectTotal) : 0.0;

        List<Condidature> forFreelancer = condidatureRepository.findByFreelancerId(freelancerId);
        long freelancerTotal = forFreelancer.size();
        double sumRating = forFreelancer.stream()
                .map(Condidature::getFreelancerRating)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
        long countWithRating = forFreelancer.stream()
                .map(Condidature::getFreelancerRating)
                .filter(java.util.Objects::nonNull)
                .count();
        double freelancerAvgRating = countWithRating > 0 ? (sumRating / countWithRating) : 0.0;
        double freelancerRate = (freelancerAvgRating / 5.0) * 100.0;

        return CondidatureDetailStatsDTO.builder()
                .projectApplicationsCount(projectTotal)
                .projectAcceptedCount(projectAccepted)
                .projectAcceptanceRatePercent(projectRate)
                .freelancerTotalApplications(freelancerTotal)
                .freelancerAverageRating(freelancerAvgRating)
                .freelancerSuccessRatePercent(freelancerRate)
                .build();
    }

    /**
     * Reject a candidature: set status to REJECTED.
     */
    @Transactional
    public CondidatureDTO reject(Long id) {
        Objects.requireNonNull(id, "id");
        Condidature entity = condidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condidature not found with id: " + id));
        entity.setStatus(CondidatureStatus.REJECTED);
        return toDTO(condidatureRepository.save(entity));
    }

    private CondidatureDTO toDTO(Condidature entity) {
        return CondidatureDTO.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .freelancerId(entity.getFreelancerId())
                .coverLetter(entity.getCoverLetter())
                .proposedPrice(entity.getProposedPrice())
                .estimatedDeliveryDays(entity.getEstimatedDeliveryDays())
                .freelancerRating(entity.getFreelancerRating())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Condidature toEntity(CondidatureRequestDTO dto) {
        return Condidature.builder()
                .projectId(dto.getProjectId())
                .freelancerId(dto.getFreelancerId())
                .coverLetter(dto.getCoverLetter())
                .proposedPrice(dto.getProposedPrice())
                .estimatedDeliveryDays(dto.getEstimatedDeliveryDays())
                .freelancerRating(dto.getFreelancerRating())
                .status(dto.getStatus() != null ? dto.getStatus() : CondidatureStatus.PENDING)
                .build();
    }
}
