package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.dto.ContratStatisticsDTO;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.exception.ContratNotFoundException;
import com.smartfreelance.condidature.repository.ContratRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratService {

    private final ContratRepository contratRepository;

    /** Minimum days between end of one contract and start of another (same client + freelancer). */
    private static final int MIN_DAYS_GAP_SAME_CLIENT_FREELANCER = 1;

    @Transactional(readOnly = true)
    public List<ContratResponse> findAll() {
        return contratRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContratResponse findById(Long id) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        return toResponse(contrat);
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByClientId(Long clientId) {
        return contratRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByFreelancerId(Long freelancerId) {
        return contratRepository.findByFreelancerId(freelancerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByStatut(Contrat.StatutContrat statut) {
        return contratRepository.findByStatut(statut).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByClientIdAndFreelancerId(Long clientId, Long freelancerId) {
        return contratRepository.findByClientIdAndFreelancerId(clientId, freelancerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findActiveByClientIdAndFreelancerId(Long clientId, Long freelancerId) {
        List<Contrat.StatutContrat> activeStatuts = List.of(
                Contrat.StatutContrat.EN_ATTENTE,
                Contrat.StatutContrat.ACTIF
        );
        return contratRepository.findByClientIdAndFreelancerIdAndStatutIn(clientId, freelancerId, activeStatuts).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContratResponse create(ContratRequest request) {
        validateNoOverlappingContract(request.getClientId(), request.getFreelancerId(),
                request.getDateDebut(), request.getDateFin(), null);
        Contrat contrat = Contrat.builder()
                .clientId(request.getClientId())
                .freelancerId(request.getFreelancerId())
                .titre(request.getTitre())
                .description(request.getDescription())
                .montant(request.getMontant())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .statut(request.getStatut())
                .latePenaltyPercent(request.getLatePenaltyPercent())
                .build();
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    @Transactional
    public ContratResponse update(Long id, ContratRequest request) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        validateNoOverlappingContract(request.getClientId(), request.getFreelancerId(),
                request.getDateDebut(), request.getDateFin(), id);
        contrat.setClientId(request.getClientId());
        contrat.setFreelancerId(request.getFreelancerId());
        contrat.setTitre(request.getTitre());
        contrat.setDescription(request.getDescription());
        contrat.setMontant(request.getMontant());
        contrat.setDateDebut(request.getDateDebut());
        contrat.setDateFin(request.getDateFin());
        contrat.setStatut(request.getStatut());
        contrat.setLatePenaltyPercent(request.getLatePenaltyPercent());
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * A client cannot have another contract with the same freelancer if dates overlap
     * or if the new start is within a short period after the previous contract end.
     */
    private void validateNoOverlappingContract(Long clientId, Long freelancerId,
                                               LocalDate newDebut, LocalDate newFin, Long excludeContratId) {
        List<Contrat> existing = contratRepository.findByClientIdAndFreelancerId(clientId, freelancerId);
        for (Contrat c : existing) {
            if (excludeContratId != null && c.getId().equals(excludeContratId)) {
                continue;
            }
            LocalDate existingDebut = c.getDateDebut();
            LocalDate existingFin = c.getDateFin();
            boolean overlaps = !newFin.isBefore(existingDebut) && !newDebut.isAfter(existingFin);
            if (overlaps) {
                throw new IllegalArgumentException(
                        "A contract already exists between this client and freelancer for overlapping dates. " +
                                "Cannot create another contract with the same client and freelancer in this period.");
            }
            LocalDate earliestNewStart = existingFin.plusDays(MIN_DAYS_GAP_SAME_CLIENT_FREELANCER);
            if (newDebut.isAfter(existingFin) && newDebut.isBefore(earliestNewStart)) {
                throw new IllegalArgumentException(
                        "A new contract with the same client and freelancer cannot start within " +
                                MIN_DAYS_GAP_SAME_CLIENT_FREELANCER + " day(s) after the previous contract end.");
            }
        }
    }

    /**
     * Client signs first. clientId must match the contract's client. Only allowed when client has not yet signed.
     */
    @Transactional
    public ContratResponse signByClient(Long id, Long clientId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getClientId().equals(clientId)) {
            throw new IllegalArgumentException("Only the contract's client can sign as client.");
        }
        if (contrat.getClientSignedAt() != null) {
            throw new IllegalArgumentException("Contract already signed by client.");
        }
        contrat.setClientSignedAt(LocalDateTime.now());
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Freelancer signs second. freelancerId must match the contract's freelancer. When both signed, status becomes ACTIF.
     */
    @Transactional
    public ContratResponse signByFreelancer(Long id, Long freelancerId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getFreelancerId().equals(freelancerId)) {
            throw new IllegalArgumentException("Only the contract's freelancer can sign as freelancer.");
        }
        if (contrat.getClientSignedAt() == null) {
            throw new IllegalArgumentException("Client must sign the contract first.");
        }
        if (contrat.getFreelancerSignedAt() != null) {
            throw new IllegalArgumentException("Contract already signed by freelancer.");
        }
        contrat.setFreelancerSignedAt(LocalDateTime.now());
        contrat.setStatut(Contrat.StatutContrat.ACTIF);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Cancel client signature. Only the contract's client can cancel, and only if freelancer has not signed yet.
     */
    @Transactional
    public ContratResponse cancelClientSign(Long id, Long clientId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getClientId().equals(clientId)) {
            throw new IllegalArgumentException("Only the contract's client can cancel client signature.");
        }
        if (contrat.getFreelancerSignedAt() != null) {
            throw new IllegalArgumentException("Cannot cancel client signature after freelancer has signed.");
        }
        contrat.setClientSignedAt(null);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Cancel freelancer signature. Only the contract's freelancer can cancel. Status reverts to EN_ATTENTE.
     */
    @Transactional
    public ContratResponse cancelFreelancerSign(Long id, Long freelancerId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getFreelancerId().equals(freelancerId)) {
            throw new IllegalArgumentException("Only the contract's freelancer can cancel freelancer signature.");
        }
        if (contrat.getFreelancerSignedAt() == null) {
            throw new IllegalArgumentException("Freelancer has not signed yet.");
        }
        contrat.setFreelancerSignedAt(null);
        contrat.setStatut(Contrat.StatutContrat.EN_ATTENTE);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    @Transactional
    public void delete(Long id) {
        if (!contratRepository.existsById(id)) {
            throw new ContratNotFoundException(id);
        }
        contratRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ContratStatisticsDTO getStatistics() {
        long completed = contratRepository.countByStatut(Contrat.StatutContrat.TERMINE);
        long active = contratRepository.countByStatut(Contrat.StatutContrat.ACTIF);
        BigDecimal spending = contratRepository.sumMontant() != null ? contratRepository.sumMontant() : BigDecimal.ZERO;
        return ContratStatisticsDTO.builder()
                .completedContracts(completed)
                .activeContracts(active)
                .clientSpending(spending)
                .build();
    }

    private ContratResponse toResponse(Contrat contrat) {
        return ContratResponse.builder()
                .id(contrat.getId())
                .clientId(contrat.getClientId())
                .freelancerId(contrat.getFreelancerId())
                .titre(contrat.getTitre())
                .description(contrat.getDescription())
                .montant(contrat.getMontant())
                .dateDebut(contrat.getDateDebut())
                .dateFin(contrat.getDateFin())
                .statut(contrat.getStatut())
                .dateCreation(contrat.getDateCreation())
                .dateModification(contrat.getDateModification())
                .clientSignedAt(contrat.getClientSignedAt())
                .freelancerSignedAt(contrat.getFreelancerSignedAt())
                .latePenaltyPercent(contrat.getLatePenaltyPercent())
                .build();
    }
}
