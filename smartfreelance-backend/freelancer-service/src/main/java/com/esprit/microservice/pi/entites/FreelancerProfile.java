// FreelancerProfile.java
package com.esprit.microservice.pi.entites;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfile {

    @Id
    private Long id; // même id que l'utilisateur

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit faire entre 2 et 50 caractères")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit faire entre 2 et 50 caractères")
    private String lastName;

    @NotBlank(message = "Le titre professionnel est obligatoire")
    @Size(min = 5, max = 80, message = "Le titre doit faire entre 5 et 80 caractères")
    private String title;

    @Size(max = 1000, message = "L'aperçu ne peut pas dépasser 1000 caractères")
    private String overview;

    @NotNull(message = "Le tarif horaire est obligatoire")
    @DecimalMin(value = "5.0", inclusive = true, message = "Le tarif minimum est 5$/h")
    @DecimalMax(value = "300.0", inclusive = true, message = "Le tarif maximum est 300$/h")
    @Column(columnDefinition = "DECIMAL(7,2)", nullable = false)
    private java.math.BigDecimal hourlyRate;

    @NotBlank(message = "Le niveau d'expérience est obligatoire")
    private String experienceLevel;

    @NotBlank(message = "La disponibilité est obligatoire")
    private String availability;

    @NotBlank(message = "Le pays est obligatoire")
    @Size(min = 2, max = 60, message = "Le pays doit faire entre 2 et 60 caractères")
    private String country;

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Skill> skills;

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<PortfolioProject> projects;

}