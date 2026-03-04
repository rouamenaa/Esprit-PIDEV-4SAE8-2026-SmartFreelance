package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.exception.ContratNotFoundException;
import com.smartfreelance.condidature.repository.ContratRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratService {

    private final ContratRepository contratRepository;

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

    @Transactional
    public ContratResponse create(ContratRequest request) {
        Contrat contrat = Contrat.builder()
                .clientId(request.getClientId())
                .freelancerId(request.getFreelancerId())
                .titre(request.getTitre())
                .description(request.getDescription())
                .montant(request.getMontant())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .statut(request.getStatut())
                .build();
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    @Transactional
    public ContratResponse update(Long id, ContratRequest request) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        contrat.setClientId(request.getClientId());
        contrat.setFreelancerId(request.getFreelancerId());
        contrat.setTitre(request.getTitre());
        contrat.setDescription(request.getDescription());
        contrat.setMontant(request.getMontant());
        contrat.setDateDebut(request.getDateDebut());
        contrat.setDateFin(request.getDateFin());
        contrat.setStatut(request.getStatut());
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
                .build();
    }
}
