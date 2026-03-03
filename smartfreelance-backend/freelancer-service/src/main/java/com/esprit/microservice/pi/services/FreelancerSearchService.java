package com.esprit.microservice.pi.services;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.repositories.FreelancerRepository;
import com.esprit.microservice.pi.specification.FreelancerSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerSearchService {

    private final FreelancerRepository repository;

    public List<FreelancerProfile> search(
            String skill,
            String level,
            String country,
            java.math.BigDecimal minRate) {

        Specification<FreelancerProfile> spec = Specification.where((Specification<FreelancerProfile>) null);

        if (skill != null)
            spec = spec.and(FreelancerSpecification.hasSkill(skill));

        if (level != null)
            spec = spec.and(FreelancerSpecification.hasLevel(level));

        if (country != null)
            spec = spec.and(FreelancerSpecification.hasCountry(country));

        if (minRate != null)
            spec = spec.and(FreelancerSpecification.minHourlyRate(minRate));

        return repository.findAll(spec);
    }
}