package com.smartfreelance.condidature.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contrat")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private Long freelancerId;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutContrat statut;

    @Column(updatable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    /** When the client signed the contract (null until client signs first). */
    private LocalDateTime clientSignedAt;

    /** When the freelancer signed the contract (null until freelancer signs after client). */
    private LocalDateTime freelancerSignedAt;

    /** Late penalty: reduce payment by this % if delivery is after end date (e.g. 5.00 = 5%). Null = no penalty. */
    @Column(name = "late_penalty_percent", precision = 5, scale = 2)
    private BigDecimal latePenaltyPercent;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    public enum StatutContrat {
        BROUILLON, EN_ATTENTE, ACTIF, TERMINE, ANNULE
    }
}
