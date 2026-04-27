package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditReportService {

    private final AuditReportRepository repository;
    private final AuditService auditService;
    private final AuditTicketRepository ticketRepository;
    private final ProjectService projectService;

    public AuditReportService(AuditReportRepository repository,
                              AuditService auditService,
                              AuditTicketRepository ticketRepository,
                              ProjectService projectService) {
        this.repository = repository;
        this.auditService = auditService;
        this.ticketRepository = ticketRepository;
        this.projectService = projectService;
    }

    public AuditReport generateReport(Integer auditId) {

        Audit audit = auditService.getOrThrow(auditId);

        if (audit.getStatus() != AuditStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Audit must be IN_PROGRESS to generate a report");
        }

        // ✅ Fix 1 : Integer → Long
        Long projectId = audit.getProjectId().longValue();

        double progress = projectService.calculateProjectProgress(projectId);
        double performanceIndex = projectService.calculateProjectPerformanceIndex(projectId);
        String classification = projectService.classifyProjectPerformance(projectId);

        AuditReport report = new AuditReport();
        report.setAuditId(auditId);
        report.setProgressScore(progress);
        report.setScore((float) performanceIndex); // ✅ Fix 2 : setScore() au lieu de setPerformanceIndex()
        report.setClassification(classification);
        report.setCreatedAt(LocalDateTime.now());
        report.setSummary(buildSummary(progress, performanceIndex, classification));

        AuditReport saved = repository.save(report);

        // ✅ Fix 3 : on passe auditId directement, plus d'objet Audit
        autoFlagAnomalies(auditId, progress, performanceIndex, classification);

        audit.setStatus(AuditStatus.REPORTED);
        auditService.saveAudit(audit);

        return saved;
    }

    public List<AuditReport> getReportsByAudit(Integer auditId) {
        return repository.findByAuditId(auditId);
    }

    // ─── LOGIQUE D'ANOMALIES AUTOMATIQUES ────────────────────────────────────

    private void autoFlagAnomalies(Integer auditId,
                                   double progress,
                                   double performanceIndex,
                                   String classification) {

        if ("CRITICAL".equals(classification)) {
            createTicket(auditId,
                    "Performance CRITICAL",
                    "Performance index is " + String.format("%.1f", performanceIndex) + "/100. Immediate action required.",
                    TicketSeverity.CRITICAL, Priority.HIGH);
        } else if ("MODERATE".equals(classification)) {
            createTicket(auditId,
                    "Performance MODERATE",
                    "Performance index is " + String.format("%.1f", performanceIndex) + "/100. Review recommended.",
                    TicketSeverity.MEDIUM, Priority.MEDIUM);
        }

        if (progress < 30) {
            createTicket(auditId,
                    "Low project progress",
                    "Project progress is only " + String.format("%.1f", progress) + "%. Risk of deadline breach.",
                    TicketSeverity.HIGH, Priority.HIGH);
        }
    }

    // ✅ Fix 3 : signature avec Integer auditId au lieu de Audit audit
    private void createTicket(Integer auditId, String title, String description,
                              TicketSeverity severity, Priority priority) {
        AuditTicket ticket = new AuditTicket();
        ticket.setAuditId(auditId);        // ✅ setAuditId() et non setAudit()
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setSeverity(severity);
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    private String buildSummary(double progress, double performanceIndex, String classification) {
        return String.format(
                "Project progress: %.1f%% | Performance index: %.1f/100 | Classification: %s",
                progress, performanceIndex, classification
        );
    }
}