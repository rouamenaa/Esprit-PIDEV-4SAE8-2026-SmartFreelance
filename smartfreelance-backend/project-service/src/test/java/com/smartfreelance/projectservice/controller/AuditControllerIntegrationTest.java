package com.smartfreelance.projectservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.entity.Audit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class AuditControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAuditCRUD() throws Exception {
        Audit audit = new Audit();
        audit.setProjectId(1);
        audit.setObjective("Audit Test Objectif");

        String json = objectMapper.writeValueAsString(audit);

        // CREATE
        String content = mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Audit created = objectMapper.readValue(content, Audit.class);

        // GET BY ID
        mockMvc.perform(get("/api/audits/{id}", created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.objective", is("Audit Test Objectif")))
                .andExpect(jsonPath("$.status", is("PENDING")));

        // START
        mockMvc.perform(put("/api/audits/{id}/start", created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));

        // CLOSE
        mockMvc.perform(put("/api/audits/{id}/close", created.getId()))
                .andExpect(status().isBadRequest());

        Audit auditToDelete = new Audit();
        auditToDelete.setProjectId(2);
        auditToDelete.setObjective("Audit to delete");

        String deleteCandidateContent = mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(auditToDelete)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Audit deleteCandidate = objectMapper.readValue(deleteCandidateContent, Audit.class);

        mockMvc.perform(delete("/api/audits/{id}", deleteCandidate.getId()))
                .andExpect(status().isNoContent());
    }
}
