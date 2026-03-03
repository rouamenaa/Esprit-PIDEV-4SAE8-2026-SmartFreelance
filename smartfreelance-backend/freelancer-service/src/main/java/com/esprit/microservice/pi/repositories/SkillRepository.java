package com.esprit.microservice.pi.repositories;

import com.esprit.microservice.pi.entites.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
