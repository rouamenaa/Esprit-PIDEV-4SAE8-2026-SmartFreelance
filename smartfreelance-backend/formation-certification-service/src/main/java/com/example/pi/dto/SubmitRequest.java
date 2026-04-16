package com.example.pi.dto;

import java.util.Map;

public class SubmitRequest {
    private Map<Long, Long> answers;  // questionId -> answerId
    private Long userId;              // ← l'id de l'utilisateur connecté

    // getters et setters
    public Map<Long, Long> getAnswers() { return answers; }
    public void setAnswers(Map<Long, Long> answers) { this.answers = answers; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}