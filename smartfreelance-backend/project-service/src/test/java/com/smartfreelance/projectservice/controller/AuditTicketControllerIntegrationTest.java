package com.smartfreelance.projectservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.repository.AuditRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class AuditTicketControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuditRepository auditRepository;

    @Test
    void testFlagAnomaly() throws Exception {
        Audit audit = new Audit();
        audit.setProjectId(1);
        audit.setCreatedBy(1);
        audit.setObjective("Integration test audit");
        Audit savedAudit = auditRepository.save(audit);

        mockMvc.perform(post("/api/audit-tickets/flag")
                .param("auditId", savedAudit.getId().toString())
                .param("title", "Test Ticket")
                .param("description", "Ticket description")
                .param("severity", TicketSeverity.CRITICAL.toString())
                .param("priority", Priority.HIGH.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()));
    }
}
