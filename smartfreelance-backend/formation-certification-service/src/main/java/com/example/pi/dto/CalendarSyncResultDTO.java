package com.example.pi.dto;

import java.time.LocalDateTime;

/**
 * DTO representing the result of a Calendar sync operation.
 */
public class CalendarSyncResultDTO {

    private String syncStatus;
    private String message;
    private Long formationId;
    private String participantEmail;
    private LocalDateTime syncedAt;

    public CalendarSyncResultDTO() {
        this.syncedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public String getSyncStatus() { return syncStatus; }
    public void setSyncStatus(String syncStatus) { this.syncStatus = syncStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getFormationId() { return formationId; }
    public void setFormationId(Long formationId) { this.formationId = formationId; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
}
