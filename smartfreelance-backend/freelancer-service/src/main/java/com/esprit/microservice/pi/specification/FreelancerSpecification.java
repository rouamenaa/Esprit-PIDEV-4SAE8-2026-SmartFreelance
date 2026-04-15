package com.esprit.microservice.pi.specification;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class FreelancerSpecification {

    public static Specification<FreelancerProfile> hasSkill(String skillName) {
        return (root, query, cb) -> {
            Join<Object, Object> skills = root.join("skills");
            return cb.like(cb.lower(skills.get("name")),
                    "%" + skillName.toLowerCase() + "%");
        };
    }

    public static Specification<FreelancerProfile> hasLevel(String level) {
        return (root, query, cb) -> {
            Join<Object, Object> skills = root.join("skills");
            return cb.equal(skills.get("level"), level);
        };
    }

    public static Specification<FreelancerProfile> hasCountry(String country) {
        return (root, query, cb) ->
                cb.equal(root.get("country"), country);
    }

    public static Specification<FreelancerProfile> minHourlyRate(java.math.BigDecimal rate) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("hourlyRate"), rate);
    }
}