package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.AuditAnalysis;
import com.smartfreelance.projectservice.service.AuditAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-ai")
public class AuditAiController {

    private final AuditAiService aiService;

    public AuditAiController(AuditAiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Lance l'analyse IA sur un rapport d'audit.
     * POST /api/audit-ai/analyze/{reportId}
     */
    @PostMapping("/analyze/{reportId}")
    public ResponseEntity<AuditAnalysis> analyze(@PathVariable Integer reportId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(aiService.analyzeReport(reportId));
    }

    /**
     * Récupère l'analyse existante d'un rapport.
     * GET /api/audit-ai/report/{reportId}
     */
    @GetMapping("/report/{reportId}")
    public ResponseEntity<AuditAnalysis> getAnalysis(@PathVariable Integer reportId) {
        return ResponseEntity.ok(aiService.getAnalysisByReport(reportId));
    }
}