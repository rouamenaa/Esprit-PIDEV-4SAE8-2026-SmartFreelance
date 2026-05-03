package com.example.micro_user.Entity;

import com.example.micro_user.Entity.Role;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class UserDTO {

    private String token;
    private Long id;
    private Role role;
    private String nom;

    private String username;
    private String email;
    private List<Float> faceDescriptor;



    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
