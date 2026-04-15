package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.AuditScore;
import com.smartfreelance.projectservice.service.AuditScoringEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-scores")
public class AuditScoringController {

    private final AuditScoringEngine scoringEngine;

    public AuditScoringController(AuditScoringEngine scoringEngine) {
        this.scoringEngine = scoringEngine;
    }

    @PostMapping("/compute/{auditId}")
    public ResponseEntity<AuditScore> compute(@PathVariable Integer auditId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scoringEngine.computeScore(auditId));
    }

    @GetMapping("/audit/{auditId}")
    public ResponseEntity<AuditScore> getByAudit(@PathVariable Integer auditId) {
        return ResponseEntity.ok(scoringEngine.getScoreByAudit(auditId));
    }

    @GetMapping("/project/{projectId}/history")
    public ResponseEntity<List<AuditScore>> getHistory(@PathVariable Integer projectId) {
        return ResponseEntity.ok(scoringEngine.getProjectHistory(projectId));
    }
}