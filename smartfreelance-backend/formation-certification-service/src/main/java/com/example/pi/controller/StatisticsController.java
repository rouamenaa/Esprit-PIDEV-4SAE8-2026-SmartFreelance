package com.example.pi.controller;

import com.example.pi.dto.FormationStatisticsDTO;
import com.example.pi.dto.GlobalStatisticsDTO;
import com.example.pi.dto.MonthlyRegistrationDTO;
import com.example.pi.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/formations/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * GET /api/formations/statistics/global
     */
    @GetMapping("/global")
    public ResponseEntity<GlobalStatisticsDTO> global() {
        return ResponseEntity.ok(statisticsService.getGlobalStatistics());
    }

    /**
     * GET /api/formations/statistics/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormationStatisticsDTO> byFormation(@PathVariable Long id) {
        return ResponseEntity.ok(statisticsService.getFormationStatistics(id));
    }

    /**
     * GET /api/formations/statistics/monthly
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyRegistrationDTO>> monthly() {
        return ResponseEntity.ok(statisticsService.getMonthlyRegistrations());
    }
}
