package com.example.pi.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FormationResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private String level;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal price;
    private Integer maxParticipants;
    private String category;

    /** Computed: UPCOMING / ONGOING / FINISHED */
    private String dynamicStatus;

    /** Computed with early-bird or surge pricing applied */
    private BigDecimal dynamicPrice;

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDynamicStatus() { return dynamicStatus; }
    public void setDynamicStatus(String dynamicStatus) { this.dynamicStatus = dynamicStatus; }

    public BigDecimal getDynamicPrice() { return dynamicPrice; }
    public void setDynamicPrice(BigDecimal dynamicPrice) { this.dynamicPrice = dynamicPrice; }
}
