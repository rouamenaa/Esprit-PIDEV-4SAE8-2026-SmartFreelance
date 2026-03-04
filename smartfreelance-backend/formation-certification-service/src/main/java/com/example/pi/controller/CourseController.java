package com.example.pi.controller;

import com.example.pi.entity.Course;
import com.example.pi.service.CourseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    @GetMapping
    public List<Course> getAll(@RequestParam(required = false) Long formationId) {
        System.out.println("FORMATION ID = " + formationId);

        if (formationId != null) {
            return service.getByFormation(formationId);
        }
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Course getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Course create(@RequestBody Course c) {
        return service.create(c);
    }

    @PutMapping("/{id}")
    public Course update(@PathVariable Long id, @RequestBody Course c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}