package com.example.pi.dto;

import java.time.LocalDate;

public class ParticipantResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private LocalDate registrationDate;
    private String status;
    private String calendarSyncStatus;

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCalendarSyncStatus() { return calendarSyncStatus; }
    public void setCalendarSyncStatus(String calendarSyncStatus) { this.calendarSyncStatus = calendarSyncStatus; }
}
