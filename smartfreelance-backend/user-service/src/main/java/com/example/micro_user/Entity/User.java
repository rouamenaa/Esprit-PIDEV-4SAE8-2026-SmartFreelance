package com.example.micro_user.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    @Column(unique = true, nullable = false) // Empêche les doublons d'email

    private String email;
    private String nom;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;





}











// Exemple : "USER" ou "ADMIN"