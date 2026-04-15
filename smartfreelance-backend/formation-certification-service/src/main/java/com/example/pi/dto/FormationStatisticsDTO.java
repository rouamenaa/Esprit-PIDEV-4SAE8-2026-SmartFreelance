package com.example.pi.dto;

public class FormationStatisticsDTO {

    private Long formationId;
    private String title;
    private long registeredCount;
    private long cancelledCount;
    private int remainingSeats;
    private double fillRate;
    private String formationStatus;

    public Long getFormationId() { return formationId; }
    public void setFormationId(Long formationId) { this.formationId = formationId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public long getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(long registeredCount) { this.registeredCount = registeredCount; }

    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }

    public int getRemainingSeats() { return remainingSeats; }
    public void setRemainingSeats(int remainingSeats) { this.remainingSeats = remainingSeats; }

    public double getFillRate() { return fillRate; }
    public void setFillRate(double fillRate) { this.fillRate = fillRate; }

    public String getFormationStatus() { return formationStatus; }
    public void setFormationStatus(String formationStatus) { this.formationStatus = formationStatus; }
}
