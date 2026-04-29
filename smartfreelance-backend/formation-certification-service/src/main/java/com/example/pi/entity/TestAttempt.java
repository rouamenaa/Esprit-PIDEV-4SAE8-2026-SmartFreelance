package com.example.pi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int score;
    private int totalPoints;
    private boolean passed;
    private LocalDateTime attemptDate;
    private Long userId;
    private String userName;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public LocalDateTime getAttemptDate() { return attemptDate; }
    public void setAttemptDate(LocalDateTime attemptDate) { this.attemptDate = attemptDate; }
    public Test getTest() { return test; }
    public void setTest(Test test) { this.test = test; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}