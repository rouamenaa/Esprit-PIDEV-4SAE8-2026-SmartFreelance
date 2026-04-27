package com.smartfreelance.projectservice.controller;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.AuditRepository;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;

import static com.smartfreelance.projectservice.enums.AuditStatus.IN_PROGRESS;
import static com.smartfreelance.projectservice.enums.AuditType.FINANCIAL;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class AuditReportControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void testGenerateReport() throws Exception {
        Project project = new Project();
        project.setTitle("Project for report");
        project.setDescription("desc");
        project.setBudget(1000.0);
        project.setStartDate(LocalDate.now().minusDays(5));
        project.setDeadline(LocalDate.now().plusDays(10));
        project.setStatus(ProjectStatus.IN_PROGRESS);
        project.setPhases(new ArrayList<>());
        project = projectRepository.save(project);

        Audit audit = new Audit();
        audit.setStatus(IN_PROGRESS);
        audit.setObjective("Test objective");
        audit.setAuditType(FINANCIAL);
        audit.setProjectId(project.getId().intValue());
        audit = auditRepository.save(audit);

        mockMvc.perform(post("/api/audit-reports/generate/{auditId}", audit.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()));
    }
}
