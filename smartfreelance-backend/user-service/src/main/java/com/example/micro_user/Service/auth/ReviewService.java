package com.example.micro_user.Service.auth;

import com.example.micro_user.Entity.Review;
import com.example.micro_user.Entity.User;
import com.example.micro_user.Repository.ReviewRepository;
import com.example.micro_user.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public Review addReview(Long reviewerId, Long reviewedId, Review review) {

        if (reviewerId.equals(reviewedId)) {
            throw new RuntimeException("Cannot review yourself");
        }

        User reviewer = userRepository.findById(reviewerId).orElseThrow();
        User reviewedUser = userRepository.findById(reviewedId).orElseThrow();

        // Prevent duplicate
        boolean exists = reviewRepository.findByReviewedUser(reviewedUser)
                .stream()
                .anyMatch(r -> r.getReviewer().getId().equals(reviewerId));

        if (exists) {
            throw new RuntimeException("Already reviewed this user");
        }

        review.setReviewer(reviewer);
        review.setReviewedUser(reviewedUser);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        updateRating(reviewedUser);

        return saved;
    }

    private void updateRating(User user) {

        List<Review> reviews = reviewRepository.findByReviewedUser(user);

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);

        user.setAverageRating(avg);
        user.setTotalReviews(reviews.size());

        userRepository.save(user);
    }

    public List<Review> getUserReviews(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return reviewRepository.findByReviewedUser(user);
    }
}
