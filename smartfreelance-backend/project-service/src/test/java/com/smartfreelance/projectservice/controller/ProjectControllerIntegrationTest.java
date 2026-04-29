package com.smartfreelance.projectservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.client.ApplicationContractClient;
import com.smartfreelance.projectservice.client.UserServiceClient;
import com.smartfreelance.projectservice.dto.external.CondidatureExternalDTO;
import com.smartfreelance.projectservice.dto.external.UserExternalDTO;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.enums.ProjectStatus;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class ProjectControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ProjectRepository projectRepository;

        @MockBean
        private UserServiceClient userServiceClient;

        @MockBean
        private ApplicationContractClient applicationContractClient;

        @Test
        void testProjectCRUD() throws Exception {
                UserExternalDTO client = new UserExternalDTO();
                client.setId(1L);
                client.setRole("CLIENT");
                when(userServiceClient.getUserById(1L)).thenReturn(client);

                UserExternalDTO freelancer = new UserExternalDTO();
                freelancer.setId(99L);
                freelancer.setRole("FREELANCER");
                when(userServiceClient.getUserById(99L)).thenReturn(freelancer);

                CondidatureExternalDTO candidature = new CondidatureExternalDTO();
                candidature.setProjectId(1L);
                candidature.setFreelancerId(99L);
                candidature.setStatus("PENDING");
                when(applicationContractClient.getCandidatures(eq(1L), eq(null)))
                                .thenReturn(List.of(candidature), Collections.emptyList());
                when(applicationContractClient.getActiveContractsByClientAndFreelancer(1L, 99L))
                                .thenReturn(Collections.emptyList());

                // CREATE
                Project project = new Project();
                project.setTitle("Integration Test Project");
                project.setClientId(1L);
                project.setStatus(ProjectStatus.DRAFT);
                String json = objectMapper.writeValueAsString(project);

                MvcResult createResult = mockMvc.perform(post("/api/projects")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Integration Test Project"))) // corrigé de $.name à
                                                                                                // $.title
                                .andReturn();

                Project created = objectMapper.readValue(createResult.getResponse().getContentAsString(),
                                Project.class);

                // GET BY ID
                mockMvc.perform(get("/api/projects/{id}", created.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Integration Test Project")));

                // UPDATE
                created.setTitle("Updated Project");
                String updatedJson = objectMapper.writeValueAsString(created);

                mockMvc.perform(put("/api/projects/{id}", created.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updatedJson))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Updated Project")));

                // APPROVE
                mockMvc.perform(put("/api/projects/{id}/approve", created.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status", is(ProjectStatus.APPROVED.toString())));

                // ASSIGN FREELANCER (used by application-contract-service via OpenFeign)
                mockMvc.perform(put("/api/projects/{id}/assign-freelancer", created.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"freelancerId\":99}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.freelancerId", is(99)))
                                .andExpect(jsonPath("$.status", is(ProjectStatus.IN_PROGRESS.toString())));

                // LIST ASSIGNED PROJECTS FOR FREELANCER
                mockMvc.perform(get("/api/projects/freelancers/{freelancerId}", 99))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id", is(created.getId().intValue())));

                // LIST PROJECTS FOR CLIENT OWNER
                mockMvc.perform(get("/api/projects/clients/{clientId}", 1))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id", is(created.getId().intValue())));

                // DELETE while IN_PROGRESS should fail
                mockMvc.perform(delete("/api/projects/{id}", created.getId()))
                                .andExpect(status().isForbidden());

                // CANCEL then DELETE should work
                mockMvc.perform(put("/api/projects/{id}/cancel", created.getId()))
                                .andExpect(status().isOk());

                mockMvc.perform(delete("/api/projects/{id}", created.getId()))
                                .andExpect(status().isOk());

                // Vérification suppression
                mockMvc.perform(get("/api/projects/{id}", created.getId()))
                                .andExpect(status().isNotFound());
        }
}
