package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.AuditAnalysis;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.repository.AuditAnalysisRepository;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class AuditAiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditReportRepository reportRepository;

    @Autowired
    private AuditAnalysisRepository analysisRepository;

    @Test
    void testGetAnalysisByReport() throws Exception {
        AuditReport report = new AuditReport();
        report.setAuditId(1);
        report.setSummary("summary");
        report.setScore(75f);
        report.setProgressScore(65.0);
        report.setClassification("MODERATE");
        report.setCreatedAt(LocalDateTime.now());
        AuditReport savedReport = reportRepository.save(report);

        AuditAnalysis analysis = new AuditAnalysis();
        analysis.setAuditReportId(savedReport.getId());
        analysis.setDiagnosis("diagnosis");
        analysis.setRecommendations("rec1|rec2");
        analysis.setCorrectionPlan("step1|step2");
        analysis.setRiskProbability(40.0);
        analysis.setAnalyzedAt(LocalDateTime.now());
        analysisRepository.save(analysis);

        mockMvc.perform(get("/api/audit-ai/report/{reportId}", savedReport.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()));
    }
}
