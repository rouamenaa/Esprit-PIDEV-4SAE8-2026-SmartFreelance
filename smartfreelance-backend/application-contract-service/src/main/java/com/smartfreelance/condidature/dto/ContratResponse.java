package com.smartfreelance.condidature.dto;

import com.smartfreelance.condidature.model.Contrat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratResponse {

    private Long id;
    private Long clientId;
    private Long freelancerId;
    private String titre;
    private String description;
    private BigDecimal montant;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Contrat.StatutContrat statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
