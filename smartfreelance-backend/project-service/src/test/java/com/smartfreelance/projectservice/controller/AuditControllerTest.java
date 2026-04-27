package com.smartfreelance.projectservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.AuditType;
import com.smartfreelance.projectservice.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuditController.class)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditService auditService;

    @Autowired
    private ObjectMapper objectMapper;

    private Audit sampleAudit;

    @BeforeEach
    void setUp() {
        sampleAudit = new Audit();
        sampleAudit.setId(1);
        sampleAudit.setProjectId(100);
        sampleAudit.setAuditType(AuditType.QUALITY);
        sampleAudit.setStatus(AuditStatus.PENDING);
        sampleAudit.setCreatedBy(1);
        sampleAudit.setObjective("Vérifier conformité projet");
        sampleAudit.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateAudit() throws Exception {
        Mockito.when(auditService.createAudit(any(Audit.class))).thenReturn(sampleAudit);

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAudit)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(sampleAudit.getId())))
                .andExpect(jsonPath("$.projectId", is(sampleAudit.getProjectId())))
                .andExpect(jsonPath("$.auditType", is(sampleAudit.getAuditType().name())))
                .andExpect(jsonPath("$.status", is(sampleAudit.getStatus().name())));
    }

    @Test
    void testGetAllAudits() throws Exception {
        List<Audit> audits = List.of(sampleAudit);
        Mockito.when(auditService.getAllAudits()).thenReturn(audits);

        mockMvc.perform(get("/api/audits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(sampleAudit.getId())));
    }

    @Test
    void testGetAuditById() throws Exception {
        Mockito.when(auditService.getAuditById(1)).thenReturn(sampleAudit);

        mockMvc.perform(get("/api/audits/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleAudit.getId())));
    }

    @Test
    void testGetAuditsByProject() throws Exception {
        List<Audit> audits = List.of(sampleAudit);
        Mockito.when(auditService.getAuditsByProject(100L)).thenReturn(audits);

        mockMvc.perform(get("/api/audits/project/{projectId}", 100L)) // <-- L à la fin
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].projectId", is(100)));
    }

    @Test
    void testStartAudit() throws Exception {
        Mockito.when(auditService.startAudit(1)).thenReturn(sampleAudit);

        mockMvc.perform(put("/api/audits/{id}/start", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleAudit.getId())));
    }

    @Test
    void testCloseAudit() throws Exception {
        Mockito.when(auditService.closeAudit(1)).thenReturn(sampleAudit);

        mockMvc.perform(put("/api/audits/{id}/close", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleAudit.getId())));
    }

    @Test
    void testDeleteAudit() throws Exception {
        Mockito.doNothing().when(auditService).deleteAudit(1);

        mockMvc.perform(delete("/api/audits/{id}", 1))
                .andExpect(status().isNoContent());
    }
}