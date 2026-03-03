package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.services.FreelancerSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class FreelancerSearchController {

    private final FreelancerSearchService searchService;

    @GetMapping("/freelancers")
    public List<FreelancerProfile> searchFreelancers(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) java.math.BigDecimal minRate) {

        return searchService.search(skill, level, country, minRate);
    }
}