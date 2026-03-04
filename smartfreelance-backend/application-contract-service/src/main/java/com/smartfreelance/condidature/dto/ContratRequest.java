package com.smartfreelance.condidature.dto;

import com.smartfreelance.condidature.model.Contrat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratRequest {

    @NotNull(message = "clientId est requis")
    private Long clientId;

    @NotNull(message = "freelancerId est requis")
    private Long freelancerId;

    @NotBlank(message = "titre est requis")
    @Size(max = 255)
    private String titre;

    @Size(max = 2000)
    private String description;

    @NotNull(message = "montant est requis")
    @DecimalMin(value = "0.01", message = "montant doit être positif")
    private BigDecimal montant;

    @NotNull(message = "dateDebut est requise")
    private LocalDate dateDebut;

    @NotNull(message = "dateFin est requise")
    private LocalDate dateFin;

    @NotNull(message = "statut est requis")
    private Contrat.StatutContrat statut;
}
