package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.repository.FormationRepository;
import com.example.pi.specification.FormationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FormationService {

    private final FormationRepository repo;

    public FormationService(FormationRepository repo) {
        this.repo = repo;
    }

    // --- Méthodes CRUD existantes ---
    public List<Formation> getAll() {
        return repo.findAll();
    }

    public Formation getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found with id: " + id));
    }

    public Formation create(Formation f) {
        f.setId(null);

        if (f.getCourses() == null) f.setCourses(new ArrayList<>());
        if (f.getRewards() == null) f.setRewards(new ArrayList<>());
        if (f.getTests() == null) f.setTests(new ArrayList<>());

        return repo.save(f);
    }

    public Formation update(Long id, Formation f) {
        Formation existing = getById(id);
        existing.setTitle(f.getTitle());
        existing.setDescription(f.getDescription());
        existing.setDuration(f.getDuration());
        existing.setLevel(f.getLevel());
        existing.setStartDate(f.getStartDate());       // ← NEW
        existing.setEndDate(f.getEndDate());           // ← NEW
        existing.setPrice(f.getPrice());               // ← NEW
        existing.setMaxParticipants(f.getMaxParticipants()); // ← NEW
        existing.setCategory(f.getCategory());         // ← NEW
        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Formation not found with id: " + id);
        }
        repo.deleteById(id);
    }

    // --- Pagination simple ---
    public Page<Formation> getAllPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.findAll(pageable);
    }

    // --- Recherche multicritères sans utiliser Specification.where() (non déprécié) ---
    public Page<Formation> searchFormations(String title, Integer minDuration, Integer maxDuration, String level,
                                            int page, int size, String sortBy, String sortDir) {
        // Construire la spécification dynamiquement
        Specification<Formation> spec = null;

        if (title != null && !title.isEmpty()) {
            spec = and(spec, FormationSpecification.hasTitle(title));
        }
        if (minDuration != null) {
            spec = and(spec, FormationSpecification.hasMinDuration(minDuration));
        }
        if (maxDuration != null) {
            spec = and(spec, FormationSpecification.hasMaxDuration(maxDuration));
        }
        if (level != null && !level.isEmpty()) {
            spec = and(spec, FormationSpecification.hasLevel(level));
        }

        // Si aucun critère, spec reste null → findAll sans spécification
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (spec == null) {
            return repo.findAll(pageable);
        }
        return repo.findAll(spec, pageable);
    }

    // Méthode utilitaire pour combiner les spécifications sans utiliser where()
    private Specification<Formation> and(Specification<Formation> current, Specification<Formation> next) {
        return current == null ? next : current.and(next);
    }
}