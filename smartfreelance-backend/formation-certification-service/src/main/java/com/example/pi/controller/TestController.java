package com.example.pi.controller;

import com.example.pi.entity.Test;
import com.example.pi.service.TestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestService service;

    public TestController(TestService service) {
        this.service = service;
    }

    @GetMapping
    public List<Test> getAll(@RequestParam(required = false) Long formationId) {
        if (formationId != null) return service.getByFormation(formationId); // ✅ corrigé
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

    @PutMapping("/{id}")
    public Test update(@PathVariable Long id, @RequestBody Test t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}