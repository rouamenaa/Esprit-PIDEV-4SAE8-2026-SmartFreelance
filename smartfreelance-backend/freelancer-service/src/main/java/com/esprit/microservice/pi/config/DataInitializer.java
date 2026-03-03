package com.esprit.microservice.pi.config;

import com.esprit.microservice.pi.entites.FreelancerProfile;
import com.esprit.microservice.pi.entites.PortfolioProject;
import com.esprit.microservice.pi.entites.Skill;
import com.esprit.microservice.pi.repositories.FreelancerRepository;
import com.esprit.microservice.pi.repositories.PortfolioRepository;
import com.esprit.microservice.pi.repositories.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final FreelancerRepository freelancerRepo;
    private final SkillRepository skillRepo;
    private final PortfolioRepository portfolioRepo;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing data...");

        // Create user 1 if doesn't exist
        if (!freelancerRepo.existsById(1L)) {
            FreelancerProfile user1 = new FreelancerProfile();
            user1.setId(1L);
            user1.setFirstName("John");
            user1.setLastName("Doe");
            user1.setTitle("Full Stack Developer");
            user1.setOverview("Experienced developer with 5+ years in web development.");
            user1.setHourlyRate(new java.math.BigDecimal("50"));
            user1.setExperienceLevel("Senior");
            user1.setAvailability("Full-time");
            user1.setCountry("Tunisia");
            user1.setSkills(new ArrayList<>());
            user1.setProjects(new ArrayList<>());

            // Add sample skills first to satisfy @Size(min = 1) validation
            Skill skill1 = new Skill();
            skill1.setName("Java");
            skill1.setLevel("Expert");
            skill1.setFreelancer(user1);
            user1.getSkills().add(skill1);

            Skill skill2 = new Skill();
            skill2.setName("Spring Boot");
            skill2.setLevel("Advanced");
            skill2.setFreelancer(user1);
            user1.getSkills().add(skill2);

            Skill skill3 = new Skill();
            skill3.setName("Angular");
            skill3.setLevel("Intermediate");
            skill3.setFreelancer(user1);
            user1.getSkills().add(skill3);

            // Add sample project
            PortfolioProject project = new PortfolioProject();
            project.setTitle("E-Commerce Platform");
            project.setDescription("Built a full e-commerce platform with Spring Boot and Angular.");
            project.setProjectUrl("https://github.com/example/ecommerce");
            project.setTechnologiesUsed("Java, Spring Boot, Angular, MySQL");
            project.setFreelancer(user1);
            user1.getProjects().add(project);

            // Save everything once (cascade will handle skills and projects if configured)
            // But manually saving them to be safe as per original logic structure
            user1 = freelancerRepo.save(user1);
            log.info("Created user 1 with ID and data: {}", user1.getId());
        } else {
            log.info("User 1 already exists");
        }

        log.info("Data initialization completed");
    }
}
