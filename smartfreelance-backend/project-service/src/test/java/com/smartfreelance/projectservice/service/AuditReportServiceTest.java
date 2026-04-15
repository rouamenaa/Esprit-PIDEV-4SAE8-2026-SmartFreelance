package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.enums.*;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditReportServiceTest {

    private AuditReportRepository reportRepository;
    private AuditService auditService;
    private AuditTicketRepository ticketRepository;
    private ProjectService projectService;

    private AuditReportService service;

    @BeforeEach
    void setUp() {
        reportRepository = mock(AuditReportRepository.class);
        auditService = mock(AuditService.class);
        ticketRepository = mock(AuditTicketRepository.class);
        projectService = mock(ProjectService.class);

        service = new AuditReportService(
                reportRepository,
                auditService,
                ticketRepository,
                projectService
        );
    }

    // ✅ TEST 1 : erreur si audit pas IN_PROGRESS
    @Test
    void shouldThrowExceptionIfAuditNotInProgress() {

        Audit audit = new Audit();
        audit.setStatus(AuditStatus.PENDING);

        when(auditService.getOrThrow(1)).thenReturn(audit);

        assertThrows(Exception.class, () -> service.generateReport(1));
    }

    // ✅ TEST 2 : génération normale du report
    @Test
    void shouldGenerateReportSuccessfully() {

        Audit audit = new Audit();
        audit.setStatus(AuditStatus.IN_PROGRESS);
        audit.setProjectId(1);

        when(auditService.getOrThrow(1)).thenReturn(audit);

        when(projectService.calculateProjectProgress(1L)).thenReturn(80.0);
        when(projectService.calculateProjectPerformanceIndex(1L)).thenReturn(85.0);
        when(projectService.classifyProjectPerformance(1L)).thenReturn("GOOD");

        when(reportRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuditReport report = service.generateReport(1);

        assertNotNull(report);
        verify(reportRepository, times(1)).save(any(AuditReport.class));
        verify(auditService, times(1)).saveAudit(audit);
    }

    // 🔥 TEST 3 : ticket créé si CRITICAL
    @Test
    void shouldCreateTicketWhenClassificationCritical() {

        Audit audit = new Audit();
        audit.setStatus(AuditStatus.IN_PROGRESS);
        audit.setProjectId(1);

        when(auditService.getOrThrow(1)).thenReturn(audit);

        when(projectService.calculateProjectProgress(1L)).thenReturn(50.0);
        when(projectService.calculateProjectPerformanceIndex(1L)).thenReturn(20.0);
        when(projectService.classifyProjectPerformance(1L)).thenReturn("CRITICAL");

        when(reportRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.generateReport(1);

        verify(ticketRepository, atLeastOnce()).save(any());
    }

    // 🔥 TEST 4 : ticket créé si progress < 30
    @Test
    void shouldCreateTicketWhenProgressLow() {

        Audit audit = new Audit();
        audit.setStatus(AuditStatus.IN_PROGRESS);
        audit.setProjectId(1);

        when(auditService.getOrThrow(1)).thenReturn(audit);

        when(projectService.calculateProjectProgress(1L)).thenReturn(20.0);
        when(projectService.calculateProjectPerformanceIndex(1L)).thenReturn(80.0);
        when(projectService.classifyProjectPerformance(1L)).thenReturn("GOOD");

        when(reportRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.generateReport(1);

        verify(ticketRepository, atLeastOnce()).save(any());
    }
}