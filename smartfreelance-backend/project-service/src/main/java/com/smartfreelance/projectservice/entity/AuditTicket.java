package com.smartfreelance.projectservice.entity;

import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer auditId;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TicketSeverity severity;  // LOW, MEDIUM, HIGH, CRITICAL

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority;

    private Integer assignedTo;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    // ─── Getters / Setters ───────────────────────────────────────────────────

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAuditId() { return auditId; }
    public void setAuditId(Integer auditId) { this.auditId = auditId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketSeverity getSeverity() { return severity; }
    public void setSeverity(TicketSeverity severity) { this.severity = severity; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Integer getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Integer assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}