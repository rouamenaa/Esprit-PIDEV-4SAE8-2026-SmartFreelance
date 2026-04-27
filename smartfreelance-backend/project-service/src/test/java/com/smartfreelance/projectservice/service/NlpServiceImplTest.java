package com.smartfreelance.projectservice.service;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class NlpServiceImplTest {

    private final NlpServiceImpl service = new NlpServiceImpl();

    @Test
    void shouldReturnUnknownForShortDescription() {
        Map<String, Object> result = service.analyzeProject("short");

        assertEquals("Unknown", result.get("category"));
        assertEquals("Unknown", result.get("complexity"));
        assertEquals("Unknown", result.get("duration"));
    }

    @Test
    void shouldEnrichKnownCategory() {
        Map<String, Object> result = service.enrichCategory("Web Application");

        assertEquals("Medium", result.get("complexity"));
        assertEquals("4–6 weeks", result.get("duration"));
        assertNotNull(result.get("stack"));
    }

    @Test
    void shouldCoverAllCategoryMappings() {
        String[] categories = {
                "Web Application",
                "Mobile Application",
                "E-commerce",
                "AI / Machine Learning",
                "Data Engineering / ETL",
                "DevOps / CI-CD",
                "Game Development",
                "Chatbot / NLP",
                "IoT",
                "Blockchain",
                "Other"
        };

        for (String category : categories) {
            Map<String, Object> result = service.enrichCategory(category);
            assertNotNull(result.get("stack"));
            assertNotNull(result.get("complexity"));
            assertNotNull(result.get("duration"));
        }
    }
}
