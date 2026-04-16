package com.example.pi.integration;

import com.example.pi.controller.TestController.CreateTestRequest;
import com.example.pi.service.TestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestService service;

    @Autowired
    private ObjectMapper objectMapper;

    // ---------------- GET ALL ----------------
    @Test
    void getAll_shouldReturnList() throws Exception {

        when(service.getAll())
                .thenReturn(List.of(new com.example.pi.entity.Test()));

        mockMvc.perform(get("/api/tests"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ---------------- GET BY ID ----------------
    @Test
    void getById_shouldReturnTest() throws Exception {

        when(service.getById(1L))
                .thenReturn(new com.example.pi.entity.Test());

        mockMvc.perform(get("/api/tests/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ---------------- CREATE ----------------
    @Test
    void create_shouldReturnCreatedTest() throws Exception {

        com.example.pi.entity.Test t = new com.example.pi.entity.Test();
        t.setTitle("Java Test");

        when(service.create(any(com.example.pi.entity.Test.class)))
                .thenReturn(t);

        mockMvc.perform(post("/api/tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(t)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ---------------- GENERATE TEST ----------------
    @Test
    void createWithQuestions_shouldReturnTest() throws Exception {

        com.example.pi.entity.Test test = new com.example.pi.entity.Test();
        test.setTitle("Generated Test");

        when(service.createWithQuestions(
                any(com.example.pi.entity.Test.class),
                anyInt()
        )).thenReturn(test);

        CreateTestRequest request = new CreateTestRequest();
        request.title = "Generated Test";
        request.passingScore = 10;
        request.formationId = 1L;
        request.numberOfQuestions = 5;

        mockMvc.perform(post("/api/tests/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ---------------- UPDATE ----------------
    @Test
    void update_shouldReturnUpdatedTest() throws Exception {

        com.example.pi.entity.Test t = new com.example.pi.entity.Test();
        t.setTitle("Updated");

        when(service.update(anyLong(), any(com.example.pi.entity.Test.class)))
                .thenReturn(t);

        mockMvc.perform(put("/api/tests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(t)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ---------------- DELETE ----------------
    @Test
    void delete_shouldReturnOk() throws Exception {

        mockMvc.perform(delete("/api/tests/1"))
                .andExpect(status().isOk());
    }

    // ---------------- FILTER BY FORMATION ----------------
    @Test
    void getAll_byFormation_shouldReturnFilteredList() throws Exception {

        when(service.getByFormation(1L))
                .thenReturn(List.of(new com.example.pi.entity.Test()));

        mockMvc.perform(get("/api/tests?formationId=1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
}