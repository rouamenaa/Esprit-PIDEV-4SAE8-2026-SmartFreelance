package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Test;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.TestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestService {

    private final TestRepository repo;
    private final FormationRepository formationRepo;

    public TestService(TestRepository repo, FormationRepository formationRepo) {
        this.repo = repo;
        this.formationRepo = formationRepo;
    }

    public List<Test> getAll() {
        return repo.findAll();
    }

    // ✅ Filtre par formationId
    public List<Test> getByFormation(Long formationId) {
        return repo.findByFormationId(formationId);
    }

    public Test getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
    }

    public Test create(Test t) {
        if (t.getFormation() == null || t.getFormation().getId() == null) {
            throw new RuntimeException("Formation is required for a test");
        }
        Formation formation = formationRepo.findById(t.getFormation().getId())
                .orElseThrow(() -> new RuntimeException("Formation not found with id: " + t.getFormation().getId()));
        t.setFormation(formation);
        return repo.save(t);
    }

    public Test update(Long id, Test t) {
        Test existing = getById(id);
        existing.setTitle(t.getTitle());
        existing.setTotalScore(t.getTotalScore());

        if (t.getFormation() != null && t.getFormation().getId() != null) {
            Formation formation = formationRepo.findById(t.getFormation().getId())
                    .orElseThrow(() -> new RuntimeException("Formation not found with id: " + t.getFormation().getId()));
            existing.setFormation(formation);
        }

        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Test not found with id: " + id);
        }
        repo.deleteById(id);
    }
}