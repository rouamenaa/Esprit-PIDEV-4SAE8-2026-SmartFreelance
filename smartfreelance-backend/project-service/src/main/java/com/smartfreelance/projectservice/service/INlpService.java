package com.smartfreelance.projectservice.service;


import java.util.Map;

public interface INlpService {

    Map<String, Object> analyzeProject(String description);
    Map<String, Object> enrichCategory(String category);

    }
