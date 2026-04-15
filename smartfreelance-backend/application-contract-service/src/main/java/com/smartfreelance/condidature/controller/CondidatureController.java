package com.smartfreelance.condidature.controller;

import com.smartfreelance.condidature.dto.CondidatureDTO;
import com.smartfreelance.condidature.dto.CondidatureDetailStatsDTO;
import com.smartfreelance.condidature.dto.CondidatureRequestDTO;
import com.smartfreelance.condidature.dto.CondidatureStatsDTO;
import com.smartfreelance.condidature.dto.CondidaturesByProjectDTO;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import com.smartfreelance.condidature.service.CondidatureService;
import com.smartfreelance.condidature.service.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/condidatures")
@RequiredArgsConstructor
public class CondidatureController {

    private final CondidatureService condidatureService;

    @GetMapping
    public ResponseEntity<List<CondidatureDTO>> getAll(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long freelancerId,
            @RequestParam(required = false) CondidatureStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean ranked) {

        if (Boolean.TRUE.equals(ranked)) {
            if (projectId != null) {
                return ResponseEntity.ok(condidatureService.findRankedByProjectId(projectId));
            }
            return ResponseEntity.ok(condidatureService.findAllRanked());
        }
        if (projectId != null && status != null) {
            return ResponseEntity.ok(condidatureService.findByProjectIdAndStatus(projectId, status));
        }
        if (projectId != null) {
            return ResponseEntity.ok(condidatureService.findByProjectId(projectId));
        }
        if (freelancerId != null) {
            return ResponseEntity.ok(condidatureService.findByFreelancerId(freelancerId));
        }
        return ResponseEntity.ok(condidatureService.findAll());
    }

    /** List condidatures grouped by project (for list view "by project"). */
    @GetMapping("/grouped-by-project")
    public ResponseEntity<List<CondidaturesByProjectDTO>> getGroupedByProject(
            @RequestParam(required = false, defaultValue = "true") boolean ranked) {
        return ResponseEntity.ok(condidatureService.getCondidaturesGroupedByProject(ranked));
    }

    /** Statistics for admin dashboard - must be before /{id} so "statistics" is not matched as id. */
    @GetMapping("/statistics")
    public ResponseEntity<CondidatureStatsDTO> getCondidatureStatistics() {
        return ResponseEntity.ok(condidatureService.getStatistics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CondidatureDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(condidatureService.findById(id));
    }

    /** Statistics related to this candidature (project + freelancer), for the details view. */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<CondidatureDetailStatsDTO> getCondidatureDetailStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(condidatureService.getCondidatureDetailStatistics(id));
    }

    @PostMapping
    public ResponseEntity<CondidatureDTO> create(@Valid @RequestBody CondidatureRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condidatureService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CondidatureDTO> update(@PathVariable Long id,
                                                @Valid @RequestBody CondidatureRequestDTO dto) {
        return ResponseEntity.ok(condidatureService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        condidatureService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<CondidatureDTO> accept(@PathVariable Long id) {
        return ResponseEntity.ok(condidatureService.accept(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CondidatureDTO> reject(@PathVariable Long id) {
        return ResponseEntity.ok(condidatureService.reject(id));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleSynchronizationFailure(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
    }
}
