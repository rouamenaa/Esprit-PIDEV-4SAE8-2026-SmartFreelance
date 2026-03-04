package com.esprit.microservice.pi.repositories;

import com.esprit.microservice.pi.entites.PortfolioProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<PortfolioProject, Long> {
}
