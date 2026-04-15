package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import com.smartfreelance.projectservice.service.AuditPdfService;
import com.smartfreelance.projectservice.service.AuditReportService;
import com.smartfreelance.projectservice.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuditReportController.class)
class AuditReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditReportService service;

    @MockBean
    private AuditPdfService pdfService;

    @MockBean
    private AuditService auditService;

    @MockBean
    private AuditTicketRepository ticketRepository;

    @MockBean
    private AuditReportRepository reportRepository;

    private AuditReport sampleReport;
    private Audit sampleAudit;
    private AuditTicket sampleTicket;

    @BeforeEach
    void setUp() {
        // Création d'un AuditReport fictif
        sampleReport = new AuditReport();
        sampleReport.setId(1);
        sampleReport.setAuditId(10);
        sampleReport.setSummary("Rapport test");

        // Audit fictif
        sampleAudit = new Audit();
        sampleAudit.setId(10);
        sampleAudit.setProjectId(100);
        sampleAudit.setObjective("Objectif test");

        // Ticket fictif
        sampleTicket = new AuditTicket();
        sampleTicket.setId(5);
        sampleTicket.setAuditId(10);
        sampleTicket.setDescription("Ticket test");
    }

    @Test
    void testGenerateReport() throws Exception {
        Mockito.when(service.generateReport(10)).thenReturn(sampleReport);

        mockMvc.perform(post("/api/audit-reports/generate/{auditId}", 10)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.auditId", is(10)))
                .andExpect(jsonPath("$.summary", is("Rapport test"))); // <- corrigé
    }

    @Test
    void testGetReportsByAudit() throws Exception {
        Mockito.when(service.getReportsByAudit(10)).thenReturn(List.of(sampleReport));

        mockMvc.perform(get("/api/audit-reports/audit/{auditId}", 10))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].auditId", is(10)));
    }

    @Test
    void testExportPdf() throws Exception {
        byte[] pdfBytes = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF en bytes

        // Mock repository et services
        Mockito.when(reportRepository.findById(1)).thenReturn(Optional.of(sampleReport));
        Mockito.when(auditService.getOrThrow(10)).thenReturn(sampleAudit);
        Mockito.when(ticketRepository.findByAuditId(10)).thenReturn(List.of(sampleTicket));
        Mockito.when(pdfService.generateAuditPdf(sampleAudit, sampleReport, List.of(sampleTicket))).thenReturn(pdfBytes);

        mockMvc.perform(get("/api/audit-reports/{id}/export/pdf", 1))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("audit-report-1.pdf")))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdfBytes));
    }
}