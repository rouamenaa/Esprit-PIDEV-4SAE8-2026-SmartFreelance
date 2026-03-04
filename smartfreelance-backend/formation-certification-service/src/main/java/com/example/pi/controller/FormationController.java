package com.example.pi.controller;

import com.example.pi.entity.Formation;
import com.example.pi.service.FormationService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/formations")
public class FormationController {

    private final FormationService service;

    public FormationController(FormationService service) {
        this.service = service;
    }

    // --- Anciens endpoints ---
    @GetMapping
    public List<Formation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Formation create(@RequestBody Formation f) {
        return service.create(f);
    }

    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id, @RequestBody Formation f) {
        return service.update(id, f);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // --- Nouveaux endpoints avancés ---

    // Endpoint paginé (nouveau chemin pour ne pas casser l'ancien)
    @GetMapping("/paged")
    public Page<Formation> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return service.getAllPaginated(page, size, sortBy, sortDir);
    }

    // Endpoint de recherche multicritères avec pagination
    @GetMapping("/search")
    public Page<Formation> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return service.searchFormations(title, minDuration, maxDuration, level, page, size, sortBy, sortDir);
    }
}