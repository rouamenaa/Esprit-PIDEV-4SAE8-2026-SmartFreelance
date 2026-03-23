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
<<<<<<< HEAD

    @Column(unique = true, nullable = false)
    private String email;

=======
    @Column(unique = true, nullable = false) // Empêche les doublons d'email

    private String email;
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    private String nom;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

<<<<<<< HEAD
    @Column(nullable = false)
    private boolean enabled = false;

    @Column
    private String confirmationToken;
}
=======




}











// Exemple : "USER" ou "ADMIN"
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
