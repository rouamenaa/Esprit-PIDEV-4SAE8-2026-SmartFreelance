package com.example.micro_user.Controller;

import com.example.micro_user.Entity.Review;
import com.example.micro_user.Service.auth.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public Review addReview(@RequestParam Long reviewerId,
                            @RequestParam Long reviewedId,
                            @RequestBody Review review) {
        return reviewService.addReview(reviewerId, reviewedId, review);
    }

    @GetMapping("/user/{id}")
    public List<Review> getReviews(@PathVariable Long id) {
        return reviewService.getUserReviews(id);
    }
}