package com.example.pi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for testing Calendar API sync manually.
 */
public class CalendarSyncRequestDTO {

    @NotNull(message = "Formation ID is required")
    private Long formationId;

    @NotNull(message = "Email is required")
    @Email(message = "Email must be valid")
    private String participantEmail;

    // ===== Getters & Setters =====
    public Long getFormationId() { return formationId; }
    public void setFormationId(Long formationId) { this.formationId = formationId; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }
}
