package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.service.AuditTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-tickets")
public class AuditTicketController {

    private final AuditTicketService service;

    public AuditTicketController(AuditTicketService service) {
        this.service = service;
    }

    /**
     * Signale manuellement une anomalie sur un audit.
     */
    @PostMapping("/flag")
    public ResponseEntity<AuditTicket> flagAnomaly(
            @RequestParam Integer auditId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam TicketSeverity severity,
            @RequestParam Priority priority) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.flagAnomaly(auditId, title, description, severity, priority));
    }

    @GetMapping("/audit/{auditId}")
    public ResponseEntity<List<AuditTicket>> getByAudit(@PathVariable Integer auditId) {
        return ResponseEntity.ok(service.getTicketsByAudit(auditId));
    }

    @GetMapping("/audit/{auditId}/open")
    public ResponseEntity<List<AuditTicket>> getOpenTickets(@PathVariable Integer auditId) {
        return ResponseEntity.ok(service.getOpenTicketsByAudit(auditId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditTicket> getTicketById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AuditTicket> updateStatus(
            @PathVariable Integer id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Integer id) {
        service.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}