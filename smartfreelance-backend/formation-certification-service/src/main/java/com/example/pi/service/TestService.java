package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Question;
import com.example.pi.entity.Test;
import com.example.pi.repository.FormationRepository;
import com.example.pi.repository.TestRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class TestService {

    private final TestRepository repo;
    private final FormationRepository formationRepo;
    private final CSVQuestionService csvQuestionService;

    public TestService(TestRepository repo, FormationRepository formationRepo,
                       CSVQuestionService csvQuestionService) {
        this.repo = repo;
        this.formationRepo = formationRepo;
        this.csvQuestionService = csvQuestionService;
    }

    public List<Test> getAll() {
        return repo.findAll();
    }

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

    // ✅ Créer test + importer questions depuis CSV
    // ✅ Créer test + questions aléatoires depuis CSV interne
    // Dans TestService.java
    // ✅ Créer test + questions depuis CSV filtré par catégorie
    public Test createWithQuestions(Test t, int numberOfQuestions) {
        if (t.getFormation() == null || t.getFormation().getId() == null) {
            throw new RuntimeException("Formation is required for a test");
        }
        Formation formation = formationRepo.findById(t.getFormation().getId())
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        t.setFormation(formation);

        Test savedTest = repo.save(t);

        // ✅ Passer la catégorie de la formation
        String category = formation.getCategory() != null ? formation.getCategory() : "IT & Software";
        List<Question> questions = csvQuestionService.generateQuestionsFromCSV(savedTest, numberOfQuestions, category);
        savedTest.setQuestions(questions);

        return repo.save(savedTest);
    }
    public Test update(Long id, Test t) {
        Test existing = getById(id);
        existing.setTitle(t.getTitle());
        existing.setPassingScore(t.getPassingScore());

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