package com.esprit.microservice.pi.repositories;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FreelancerRepository
        extends JpaRepository<FreelancerProfile, Long>,
        JpaSpecificationExecutor<FreelancerProfile> {
}