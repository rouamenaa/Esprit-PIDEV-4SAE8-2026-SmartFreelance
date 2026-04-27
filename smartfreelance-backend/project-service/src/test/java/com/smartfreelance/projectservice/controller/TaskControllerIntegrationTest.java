package com.smartfreelance.projectservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.enums.TaskPriority;
import com.smartfreelance.projectservice.enums.TaskStatus;
import com.smartfreelance.projectservice.repository.ProjectPhaseRepository;
import com.smartfreelance.projectservice.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class TaskControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private TaskRepository taskRepository;

        @Autowired
        private ProjectPhaseRepository phaseRepository;

        private ProjectPhase savedPhase;

        @BeforeEach
        void setUp() {
                taskRepository.deleteAll();
                phaseRepository.deleteAll();

                // Créer une phase pour lier aux tasks
                ProjectPhase phase = new ProjectPhase();
                phase.setName("Phase Test");
                savedPhase = phaseRepository.save(phase);
        }

        @Test
        void testTaskCRUD() throws Exception {
                Map<String, Object> payload = Map.of(
                                "title", "Integration Task Test",
                                "description", "Description Task Test",
                                "dueDate", LocalDate.now().plusDays(5).toString(),
                                "status", TaskStatus.TODO.name(),
                                "priority", TaskPriority.HIGH.name(),
                                "phase", Map.of("id", savedPhase.getId()));

                String content = mockMvc.perform(post("/api/tasks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Integration Task Test")))
                                .andReturn().getResponse().getContentAsString();

                Long createdId = objectMapper.readTree(content).path("id").asLong();

                mockMvc.perform(get("/api/tasks/{id}", createdId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Integration Task Test")));

                Map<String, Object> updatePayload = Map.of(
                                "title", "Updated Task",
                                "description", "Description Task Test",
                                "status", TaskStatus.TODO.name(),
                                "priority", TaskPriority.HIGH.name());

                mockMvc.perform(put("/api/tasks/{id}", createdId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updatePayload)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Updated Task")));

                mockMvc.perform(delete("/api/tasks/{id}", createdId))
                                .andExpect(status().isOk());
        }
}
