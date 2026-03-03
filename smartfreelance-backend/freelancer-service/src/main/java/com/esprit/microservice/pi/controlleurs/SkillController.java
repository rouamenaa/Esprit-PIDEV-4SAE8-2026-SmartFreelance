package com.esprit.microservice.pi.controlleurs;

import com.esprit.microservice.pi.entites.Skill;
import com.esprit.microservice.pi.repositories.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "http://localhost:4200")
public class SkillController {

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(skillRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable Long id) {
        return skillRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Skill> createSkill(@RequestBody Skill skill) {
        return ResponseEntity.ok(skillRepository.save(skill));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Skill> updateSkill(@PathVariable Long id, @RequestBody Skill skillDetails) {
        return skillRepository.findById(id)
                .map(skill -> {
                    skill.setName(skillDetails.getName());
                    skill.setLevel(skillDetails.getLevel());
                    return ResponseEntity.ok(skillRepository.save(skill));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
