package com.smartfreelance.projectservice.controller;


import com.smartfreelance.projectservice.service.INlpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/nlp")
public class NlpController {

    @Autowired
    private INlpService nlpService;

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, String> body) {
        String description = body.get("text");
        return nlpService.analyzeProject(description);
    }
}
