package com.example.pi.service;

import com.example.pi.entity.Course;
import com.example.pi.entity.Formation;
import com.example.pi.repository.CourseRepository;
import com.example.pi.repository.FormationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository repo;
    private final FormationRepository formationRepo;

    public CourseService(CourseRepository repo, FormationRepository formationRepo) {
        this.repo = repo;
        this.formationRepo = formationRepo;
    }

    public List<Course> getAll() {
        return repo.findAll();
    }

    public List<Course> getByFormation(Long formationId) {
        return repo.findByFormationId(formationId);
    }

    public Course getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }

    public Course create(Course c) {
        if (c.getFormation() == null || c.getFormation().getId() == null) {
            throw new RuntimeException("Formation is required for a course");
        }

        Formation formation = formationRepo.findById(c.getFormation().getId())
                .orElseThrow(() -> new RuntimeException("Formation not found"));

        c.setFormation(formation);
        return repo.save(c);
    }

    public Course update(Long id, Course c) {
        Course existing = getById(id);

        existing.setTitle(c.getTitle());
        existing.setContent(c.getContent());
        existing.setVideoUrl(c.getVideoUrl());

        if (c.getFormation() != null && c.getFormation().getId() != null) {
            Formation formation = formationRepo.findById(c.getFormation().getId())
                    .orElseThrow(() -> new RuntimeException("Formation not found"));
            existing.setFormation(formation);
        }

        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}