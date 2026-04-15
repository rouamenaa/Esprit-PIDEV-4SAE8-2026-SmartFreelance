package com.smartfreelance.projectservice.entity;

import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.AuditType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer projectId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AuditType auditType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AuditStatus status;

    private Integer createdBy;

    private String objective;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime closedAt;

    // ─── Getters / Setters ───────────────────────────────────────────────────

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }

    public AuditType getAuditType() { return auditType; }
    public void setAuditType(AuditType auditType) { this.auditType = auditType; }

    public AuditStatus getStatus() { return status; }
    public void setStatus(AuditStatus status) { this.status = status; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
}