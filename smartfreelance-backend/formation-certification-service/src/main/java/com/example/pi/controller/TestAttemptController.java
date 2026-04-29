package com.example.pi.controller;

import com.example.pi.dto.SubmitRequest;
import com.example.pi.entity.TestAttempt;
import com.example.pi.service.TestAttemptService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class TestAttemptController {

    private final TestAttemptService service;

    public TestAttemptController(TestAttemptService service) {
        this.service = service;
    }

    @PostMapping("/submit/{testId}")
    public TestAttempt submit(@PathVariable Long testId,
                              @RequestBody SubmitRequest request) {
        return service.submit(testId, request);
    }

    @GetMapping
    public List<TestAttempt> getAll() {
        return service.getAll();
    }

    @GetMapping("/test/{testId}")
    public List<TestAttempt> getByTest(@PathVariable Long testId) {
        return service.getByTest(testId);
    }

    @GetMapping("/{id}")
    public TestAttempt getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}