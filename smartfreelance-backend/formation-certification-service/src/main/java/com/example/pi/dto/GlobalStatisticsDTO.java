package com.example.pi.dto;

import java.math.BigDecimal;

public class GlobalStatisticsDTO {

    private long totalFormations;
    private long totalParticipants;
    private BigDecimal averagePrice;
    private String mostPopularCategory;

    public long getTotalFormations() { return totalFormations; }
    public void setTotalFormations(long totalFormations) { this.totalFormations = totalFormations; }

    public long getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(long totalParticipants) { this.totalParticipants = totalParticipants; }

    public BigDecimal getAveragePrice() { return averagePrice; }
    public void setAveragePrice(BigDecimal averagePrice) { this.averagePrice = averagePrice; }

    public String getMostPopularCategory() { return mostPopularCategory; }
    public void setMostPopularCategory(String mostPopularCategory) { this.mostPopularCategory = mostPopularCategory; }
}
