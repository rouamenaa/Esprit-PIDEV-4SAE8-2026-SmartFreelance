package com.example.pi.controller;

import com.example.pi.entity.Reward;
import com.example.pi.service.RewardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService service;

    public RewardController(RewardService service) {
        this.service = service;
    }

    @GetMapping
    public List<Reward> getAll(@RequestParam(required = false) Long formationId) {
        if (formationId != null) return service.getByFormation(formationId); // ✅ filtre ajouté
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Reward getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Reward create(@RequestBody Reward r) {
        return service.create(r);
    }

    @PutMapping("/{id}")
    public Reward update(@PathVariable Long id, @RequestBody Reward r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}