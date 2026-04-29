package com.example.pi.dto;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;  // ou un enum si tu préfères, mais string pour l'exemple

    // Constructeurs
    public UserDTO() {}

    public UserDTO(Long id, String username, String email, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // Méthode utilitaire pour affichage
    public String getDisplayName() {
        return username != null ? username : "Utilisateur";
    }
}