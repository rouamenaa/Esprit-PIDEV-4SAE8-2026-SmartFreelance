package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Task;
import com.smartfreelance.projectservice.service.ActionPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//nbvcx
@RequestMapping("/api/action-plan")
public class ActionPlanController {

    private final ActionPlanService actionPlanService;

    public ActionPlanController(ActionPlanService actionPlanService) {
        this.actionPlanService = actionPlanService;
    }

    /**
     * Génère le plan d'action depuis l'analyse IA.
     * POST /api/action-plan/generate/{analysisId}
     */
    @PostMapping("/generate/{analysisId}")
    public ResponseEntity<List<Task>> generate(@PathVariable Integer analysisId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actionPlanService.generateActionPlan(analysisId));
    }

    /**
     * Récupère le plan d'action d'une analyse.
     * GET /api/action-plan/analysis/{analysisId}
     */
    @GetMapping("/analysis/{analysisId}")
    public ResponseEntity<List<Task>> getByAnalysis(@PathVariable Integer analysisId) {
        return ResponseEntity.ok(actionPlanService.getActionPlanByAnalysis(analysisId));
    }
}