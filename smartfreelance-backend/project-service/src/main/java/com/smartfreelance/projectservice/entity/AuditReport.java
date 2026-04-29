package com.smartfreelance.projectservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer auditId;

    private String summary;

    private Float score;           // performance index (0–100)
    private Double progressScore;  // avancement des tâches (0–100)
    private String classification; // HIGH_PERFORMANCE / MODERATE / CRITICAL

    private LocalDateTime createdAt;

    // ─── Getters / Setters ───────────────────────────────────────────────────

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAuditId() { return auditId; }
    public void setAuditId(Integer auditId) { this.auditId = auditId; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Float getScore() { return score; }
    public void setScore(Float score) { this.score = score; }

    public Double getProgressScore() { return progressScore; }
    public void setProgressScore(Double progressScore) { this.progressScore = progressScore; }

    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}