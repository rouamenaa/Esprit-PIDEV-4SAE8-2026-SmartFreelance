package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.DTO.ProfileAnalyticsDTO;
import com.esprit.microservice.pi.services.ProfileAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ProfileAnalyticsController {

    private final ProfileAnalyticsService analyticsService;

    @GetMapping("/{id}/analytics")
    public ProfileAnalyticsDTO getAnalytics(@PathVariable Long id) {
        return analyticsService.getAnalytics(id);
    }
}