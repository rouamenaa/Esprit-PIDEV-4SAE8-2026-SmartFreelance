package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.AuditType;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AuditPdfServiceTest {

    private final AuditPdfService service = new AuditPdfService();

    @Test
    void shouldGeneratePdfWithReportAndTickets() {
        Audit audit = audit();
        AuditReport report = report("CRITICAL", 42f, 35.0);
        List<AuditTicket> tickets = List.of(
                ticket("Broken auth", "Fix login issue", TicketSeverity.CRITICAL, Priority.HIGH, TicketStatus.OPEN),
                ticket("Optimize query", "Slow SQL", TicketSeverity.HIGH, Priority.MEDIUM, TicketStatus.RESOLVED),
                ticket("UI typo", "Minor label", TicketSeverity.LOW, Priority.LOW, null)
        );

        byte[] pdf = service.generateAuditPdf(audit, report, tickets);

        assertNotNull(pdf);
        assertTrue(pdf.length > 1000);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    @Test
    void shouldGeneratePdfWhenReportIsNullAndNoTickets() {
        byte[] pdf = service.generateAuditPdf(audit(), null, Collections.emptyList());

        assertNotNull(pdf);
        assertTrue(pdf.length > 500);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    @Test
    void shouldGeneratePdfForModerateAndHighPerformanceRecommendations() {
        byte[] moderatePdf = service.generateAuditPdf(
                audit(),
                report("MODERATE", 65f, 58.0),
                Collections.emptyList());

        byte[] highPdf = service.generateAuditPdf(
                audit(),
                report("HIGH_PERFORMANCE", 92f, 88.0),
                Collections.emptyList());

        assertTrue(moderatePdf.length > 500);
        assertTrue(highPdf.length > 500);
    }

    private Audit audit() {
        Audit audit = new Audit();
        audit.setId(10);
        audit.setProjectId(22);
        audit.setAuditType(AuditType.QUALITY);
        audit.setStatus(AuditStatus.REPORTED);
        audit.setCreatedBy(1);
        return audit;
    }

    private AuditReport report(String classification, Float score, Double progress) {
        AuditReport report = new AuditReport();
        report.setClassification(classification);
        report.setScore(score);
        report.setProgressScore(progress);
        return report;
    }

    private AuditTicket ticket(String title, String description, TicketSeverity severity,
            Priority priority, TicketStatus status) {
        AuditTicket t = new AuditTicket();
        t.setTitle(title);
        t.setDescription(description);
        t.setSeverity(severity);
        t.setPriority(priority);
        t.setStatus(status);
        return t;
    }
}
