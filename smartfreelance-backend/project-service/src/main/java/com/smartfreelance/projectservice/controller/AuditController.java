package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.service.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<Audit> createAudit(@RequestBody Audit audit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditService.createAudit(audit));
    }

    @GetMapping
    public ResponseEntity<List<Audit>> getAllAudits() {
        return ResponseEntity.ok(auditService.getAllAudits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Audit> getAuditById(@PathVariable Integer id) {
        return ResponseEntity.ok(auditService.getAuditById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Audit>> getAuditsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(auditService.getAuditsByProject(projectId));
    }

    // ─── CYCLE DE VIE ────────────────────────────────────────────────────────

    @PutMapping("/{id}/start")
    public ResponseEntity<Audit> startAudit(@PathVariable Integer id) {
        return ResponseEntity.ok(auditService.startAudit(id));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Audit> closeAudit(@PathVariable Integer id) {
        return ResponseEntity.ok(auditService.closeAudit(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudit(@PathVariable Integer id) {
        auditService.deleteAudit(id);
        return ResponseEntity.noContent().build();
    }
}