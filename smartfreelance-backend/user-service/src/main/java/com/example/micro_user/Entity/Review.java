package com.example.micro_user.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;
    private String comment;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private User reviewedUser;

    private java.time.LocalDateTime createdAt;
}
