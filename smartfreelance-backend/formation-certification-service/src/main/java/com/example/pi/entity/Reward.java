package com.example.pi.entity;

import jakarta.persistence.*;

@Entity
public class Reward {

    public enum RewardType { BADGE, LEVEL }
    public enum Level { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private RewardType type;

    @Enumerated(EnumType.STRING)
    private Level level;

    private int minScoreRequired;
    private String iconUrl;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public RewardType getType() { return type; }
    public void setType(RewardType type) { this.type = type; }
    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
    public int getMinScoreRequired() { return minScoreRequired; }
    public void setMinScoreRequired(int minScoreRequired) { this.minScoreRequired = minScoreRequired; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public Formation getFormation() { return formation; }
    public void setFormation(Formation formation) { this.formation = formation; }
}