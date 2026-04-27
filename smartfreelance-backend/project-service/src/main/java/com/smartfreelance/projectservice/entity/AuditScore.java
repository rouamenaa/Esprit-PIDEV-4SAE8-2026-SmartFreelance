package com.smartfreelance.projectservice.entity;

import com.smartfreelance.projectservice.enums.AuditVerdict;
import com.smartfreelance.projectservice.enums.AuditTrend;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer auditId;
    private Integer projectId;

    private Double qualityScore;
    private Double temporalScore;
    private Double structuralScore;
    private Double resolutionScore;
    private Double compositeScore;      // score final 0-100

    private Double platformAverage;     // moyenne de tous les audits
    private Double projectAverage;      // moyenne des audits de ce projet
    private Double deltaFromPrevious;   // écart avec l'audit précédent

    @Enumerated(EnumType.STRING)
    private AuditVerdict verdict;       // CERTIFIED / CONDITIONAL / REJECTED

    @Enumerated(EnumType.STRING)
    private AuditTrend trend;           // IMPROVING / STABLE / DEGRADING / CRITICAL_DRIFT

    private Double confidenceLevel;     // niveau de confiance 0-100
    private String verdictStatement;    // texte formel du verdict

    private LocalDateTime calculatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getAuditId() { return auditId; }
    public void setAuditId(Integer auditId) { this.auditId = auditId; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public Double getQualityScore() { return qualityScore; }
    public void setQualityScore(Double qualityScore) { this.qualityScore = qualityScore; }
    public Double getTemporalScore() { return temporalScore; }
    public void setTemporalScore(Double temporalScore) { this.temporalScore = temporalScore; }
    public Double getStructuralScore() { return structuralScore; }
    public void setStructuralScore(Double structuralScore) { this.structuralScore = structuralScore; }
    public Double getResolutionScore() { return resolutionScore; }
    public void setResolutionScore(Double resolutionScore) { this.resolutionScore = resolutionScore; }
    public Double getCompositeScore() { return compositeScore; }
    public void setCompositeScore(Double compositeScore) { this.compositeScore = compositeScore; }
    public Double getPlatformAverage() { return platformAverage; }
    public void setPlatformAverage(Double platformAverage) { this.platformAverage = platformAverage; }
    public Double getProjectAverage() { return projectAverage; }
    public void setProjectAverage(Double projectAverage) { this.projectAverage = projectAverage; }
    public Double getDeltaFromPrevious() { return deltaFromPrevious; }
    public void setDeltaFromPrevious(Double deltaFromPrevious) { this.deltaFromPrevious = deltaFromPrevious; }
    public AuditVerdict getVerdict() { return verdict; }
    public void setVerdict(AuditVerdict verdict) { this.verdict = verdict; }
    public AuditTrend getTrend() { return trend; }
    public void setTrend(AuditTrend trend) { this.trend = trend; }
    public Double getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(Double confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public String getVerdictStatement() { return verdictStatement; }
    public void setVerdictStatement(String verdictStatement) { this.verdictStatement = verdictStatement; }
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
}