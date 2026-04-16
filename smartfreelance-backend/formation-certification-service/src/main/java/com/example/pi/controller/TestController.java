package com.example.pi.controller;

import com.example.pi.entity.Test;
import com.example.pi.service.TestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestService service;

    public TestController(TestService service) {
        this.service = service;
    }

    @GetMapping
    public List<Test> getAll(@RequestParam(required = false) Long formationId) {
        if (formationId != null) return service.getByFormation(formationId);
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Test getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Test create(@RequestBody Test t) {
        return service.create(t);
    }

    // ✅ Créer test + générer questions depuis CSV interne
    public static class CreateTestRequest {
        public String title;
        public int passingScore;
        public Long formationId;
        public int numberOfQuestions;
    }

    @PostMapping("/generate")
    public ResponseEntity<Test> createWithQuestions(@RequestBody CreateTestRequest request) {
        Test t = new Test();
        t.setTitle(request.title);
        t.setPassingScore(request.passingScore);

        com.example.pi.entity.Formation formation = new com.example.pi.entity.Formation();
        formation.setId(request.formationId);
        t.setFormation(formation);

        return ResponseEntity.ok(service.createWithQuestions(t, request.numberOfQuestions));
    }

    @PutMapping("/{id}")
    public Test update(@PathVariable Long id, @RequestBody Test t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}