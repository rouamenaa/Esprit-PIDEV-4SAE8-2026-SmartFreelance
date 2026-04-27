package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import com.smartfreelance.projectservice.service.AuditPdfService;
import com.smartfreelance.projectservice.service.AuditReportService;
import com.smartfreelance.projectservice.service.AuditService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-reports")
public class AuditReportController {

    private final AuditReportService service;
    private final AuditPdfService pdfService;
    private final AuditService auditService;
    private final AuditTicketRepository ticketRepository;
    private final AuditReportRepository reportRepository; //

    // Constructeur unique
    public AuditReportController(AuditReportService service,
                                 AuditPdfService pdfService,
                                 AuditService auditService,
                                 AuditTicketRepository ticketRepository,
                                 AuditReportRepository reportRepository) { 
        this.service = service;
        this.pdfService = pdfService;
        this.auditService = auditService;
        this.ticketRepository = ticketRepository;
        this.reportRepository = reportRepository; // initialisé
    }

    /**
     * Génère automatiquement le rapport à partir des données du projet.
     * L'audit doit être IN_PROGRESS.
     */
    @PostMapping("/generate/{auditId}")
    public ResponseEntity<AuditReport> generateReport(@PathVariable Integer auditId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.generateReport(auditId));
    }

    @GetMapping("/audit/{auditId}")
    public ResponseEntity<List<AuditReport>> getReportsByAudit(@PathVariable Integer auditId) {
        return ResponseEntity.ok(service.getReportsByAudit(auditId));
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Integer id) {

        // Récupérer rapport
        AuditReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AuditReport not found with id " + id));

        // Récupérer audit
        Audit audit = auditService.getOrThrow(report.getAuditId());

        // Récupérer tickets
        List<AuditTicket> tickets = ticketRepository.findByAuditId(report.getAuditId());

        // Générer PDF
        byte[] pdf = pdfService.generateAuditPdf(audit, report, tickets);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=audit-report-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}