package com.example.micro_user.Service.auth;

import java.util.List;

public class FaceLoginRequest {

    private String email;
    private List<Float> descriptor;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Float> getDescriptor() {
        return descriptor;
    }

    public void setDescriptor(List<Float> descriptor) {
        this.descriptor = descriptor;
    }
}