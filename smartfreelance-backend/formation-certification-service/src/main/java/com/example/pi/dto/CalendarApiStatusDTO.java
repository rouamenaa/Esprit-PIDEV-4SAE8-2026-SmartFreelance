package com.example.pi.dto;

import java.time.LocalDateTime;

/**
 * DTO representing the status of the Calendar API connection.
 */
public class CalendarApiStatusDTO {

    private boolean available;
    private String status;
    private String message;
    private String circuitBreakerState;
    private LocalDateTime checkedAt;
    private String calendarApiUrl;

    public CalendarApiStatusDTO() {
        this.checkedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCircuitBreakerState() { return circuitBreakerState; }
    public void setCircuitBreakerState(String circuitBreakerState) { this.circuitBreakerState = circuitBreakerState; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }

    public String getCalendarApiUrl() { return calendarApiUrl; }
    public void setCalendarApiUrl(String calendarApiUrl) { this.calendarApiUrl = calendarApiUrl; }
}
