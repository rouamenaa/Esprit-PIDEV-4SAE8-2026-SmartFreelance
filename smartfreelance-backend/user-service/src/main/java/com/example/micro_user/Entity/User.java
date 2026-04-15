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

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)

    private String nom;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column
    private String confirmationToken;
<<<<<<< HEAD
    // 🔥 PROFILE
    private String bio;

    @ElementCollection
    private java.util.List<String> skills;

    private String experienceLevel;
    private Double hourlyRate;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus;

    // 🔐 SYSTEM
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    private java.time.LocalDateTime lastLogin;

    private boolean deleted = false;

    // 🧠 SMART
    private Integer profileCompletion;

    // 📁 FILES
    private String profilePicture;
    private String cvPath;

    // 🧠 PROFILE LEVEL
    private String profileLevel; // WEAK / MEDIUM / STRONG

    private java.time.LocalDateTime createdAt;

    private boolean online;

    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    // 📊 ANALYTICS
    private Integer totalProjects = 0;
    private Double successRate = 0.0;

}
=======
}


>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
