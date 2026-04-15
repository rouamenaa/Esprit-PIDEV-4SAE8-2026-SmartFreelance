package com.smartfreelance.projectservice.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer auditReportId;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(columnDefinition = "TEXT")
    private String correctionPlan;

    private Double riskProbability; // 0-100

    private LocalDateTime analyzedAt;

    // ── Getters / Setters ─────────────────────────────────────────────────

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAuditReportId() { return auditReportId; }
    public void setAuditReportId(Integer auditReportId) { this.auditReportId = auditReportId; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getCorrectionPlan() { return correctionPlan; }
    public void setCorrectionPlan(String correctionPlan) { this.correctionPlan = correctionPlan; }

    public Double getRiskProbability() { return riskProbability; }
    public void setRiskProbability(Double riskProbability) { this.riskProbability = riskProbability; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}