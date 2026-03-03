// Skill.java
package com.esprit.microservice.pi.entites;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la compétence est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit faire entre 2 et 50 caractères")
    private String name;

    @NotBlank(message = "Le niveau est obligatoire")
    @Pattern(regexp = "^(Beginner|Intermediate|Advanced|Expert)$",
            message = "Niveau invalide : Beginner, Intermediate, Advanced ou Expert")
    private String level;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private FreelancerProfile freelancer;
}