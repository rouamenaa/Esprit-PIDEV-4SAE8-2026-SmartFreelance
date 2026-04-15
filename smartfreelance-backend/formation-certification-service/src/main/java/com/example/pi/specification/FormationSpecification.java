package com.example.pi.specification;

import com.example.pi.entity.Formation;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;  // ← changement ici

public class FormationSpecification {

    public static Specification<Formation> hasTitle(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isEmpty()) return null;
            return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Formation> hasMinDuration(Integer minDuration) {
        return (root, query, cb) -> {
            if (minDuration == null) return null;
            return cb.greaterThanOrEqualTo(root.get("duration"), minDuration);
        };
    }

    public static Specification<Formation> hasMaxDuration(Integer maxDuration) {
        return (root, query, cb) -> {
            if (maxDuration == null) return null;
            return cb.lessThanOrEqualTo(root.get("duration"), maxDuration);
        };
    }

    public static Specification<Formation> hasLevel(String level) {
        return (root, query, cb) -> {
            if (level == null || level.isEmpty()) return null;
            return cb.equal(root.get("level"), level);
        };
    }
}