package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.DTO.ProfileCompletionDTO;
import com.esprit.microservice.pi.services.ProfileCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class FreelancerProfileController {

    private final ProfileCompletionService completionService;

    @GetMapping("/{id}/completion")
    public ProfileCompletionDTO getProfileCompletion(@PathVariable Long id) {
        return completionService.calculateCompletion(id);
    }
}