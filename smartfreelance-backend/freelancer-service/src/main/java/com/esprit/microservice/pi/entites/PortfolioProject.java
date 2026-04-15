// PortfolioProject.java
package com.esprit.microservice.pi.entites;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre du projet est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit faire entre 3 et 100 caractères")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    @Size(min = 3, max = 1000, message = "La description doit faire entre 3 et 1000 caractères")
    private String description;

    @Pattern(regexp = "^$|^https?://.*", message = "URL invalide - doit commencer par http:// ou https://")
    @Size(max = 255)
    private String projectUrl;  // optionnel → accepte vide ou URL valide

    @Size(max = 200, message = "Les technologies ne peuvent pas dépasser 200 caractères")
    private String technologiesUsed;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private FreelancerProfile freelancer;
}