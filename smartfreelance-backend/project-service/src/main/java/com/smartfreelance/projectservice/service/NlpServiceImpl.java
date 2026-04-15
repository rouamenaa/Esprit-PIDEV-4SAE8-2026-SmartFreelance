package com.smartfreelance.projectservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NlpServiceImpl implements INlpService {

    private final String PYTHON_URL = "http://127.0.0.1:8000/analyze";

    @Override
    public Map<String, Object> analyzeProject(String description) {
        Map<String, Object> response = new HashMap<>();

        if (description == null || description.trim().length() < 10) {
            response.put("category", "Unknown");
            response.put("stack", new String[]{});
            response.put("complexity", "Unknown");
            response.put("duration", "Unknown");
            return response;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            Map<String, String> request = new HashMap<>();
            request.put("text", description);

            Map<String, Object> nlpResponse =
                    restTemplate.postForObject(PYTHON_URL, request, Map.class);

            // 🔍 LOG 1 : voir ce que renvoie FastAPI
            System.out.println("Description envoyée : " + description);
            System.out.println("Réponse brute FastAPI : " + nlpResponse);

            String category = (String) nlpResponse.get("category");

            if (category != null && !category.equalsIgnoreCase("Unknown")) {

                Map<String, Object> enriched = enrichCategory(category);

                // 🔍 LOG 2 : voir ce que retourne enrichCategory
                System.out.println("Données enrichies : " + enriched);

                nlpResponse.putAll(enriched);

                // 🔍 LOG 3 : voir la réponse finale envoyée à Angular
                System.out.println("Réponse finale envoyée au front : " + nlpResponse);

            } else {
                nlpResponse.put("stack", new String[]{});
                nlpResponse.put("complexity", "Unknown");
                nlpResponse.put("duration", "Unknown");
            }

            response = nlpResponse;

        } catch (Exception e) {
            e.printStackTrace(); // 🔍 voir erreurs éventuelles
            response.put("category", "Unknown");
            response.put("stack", new String[]{});
            response.put("complexity", "Unknown");
            response.put("duration", "Unknown");
        }

        return response;
    }

    public Map<String, Object> enrichCategory(String category) {
        Map<String, Object> info = new HashMap<>();

        switch(category) {
            case "Web Application":
                info.put("stack", new String[]{"Angular", "Spring Boot", "MySQL"});
                info.put("complexity", "Medium");
                info.put("duration", "4–6 weeks");
                break;
            case "Mobile Application":
                info.put("stack", new String[]{"React Native", "Node.js", "Firebase"});
                info.put("complexity", "Medium");
                info.put("duration", "4–8 weeks");
                break;
            case "E-commerce":
                info.put("stack", new String[]{"React", "Node.js", "MongoDB", "Stripe"});
                info.put("complexity", "Medium");
                info.put("duration", "3–5 weeks");
                break;
            case "AI / Machine Learning":
                info.put("stack", new String[]{"Python", "TensorFlow", "PyTorch", "Scikit-learn"});
                info.put("complexity", "High");
                info.put("duration", "6–12 weeks");
                break;
            case "Data Engineering / ETL":
                info.put("stack", new String[]{"Python", "Airflow", "PostgreSQL"});
                info.put("complexity", "Medium");
                info.put("duration", "4–8 weeks");
                break;
            case "DevOps / CI-CD":
                info.put("stack", new String[]{"Docker", "Kubernetes", "Jenkins"});
                info.put("complexity", "Medium");
                info.put("duration", "3–6 weeks");
                break;
            case "Game Development":
                info.put("stack", new String[]{"Unity", "C#", "Photon"});
                info.put("complexity", "High");
                info.put("duration", "6–12 weeks");
                break;
            case "Chatbot / NLP":
                info.put("stack", new String[]{"Python", "Transformers", "Flask"});
                info.put("complexity", "Medium");
                info.put("duration", "3–6 weeks");
                break;
            case "IoT":
                info.put("stack", new String[]{"Python", "MQTT", "Raspberry Pi"});
                info.put("complexity", "High");
                info.put("duration", "6–10 weeks");
                break;
            case "Blockchain":
                info.put("stack", new String[]{"Solidity", "Ethereum", "Web3.js"});
                info.put("complexity", "High");
                info.put("duration", "6–12 weeks");
                break;
            default:
                info.put("stack", new String[]{});
                info.put("complexity", "Unknown");
                info.put("duration", "Unknown");
                break;
        }

        return info;
    }
}