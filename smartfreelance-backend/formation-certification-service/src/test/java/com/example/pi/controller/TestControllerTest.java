package com.example.pi.controller;

import com.example.pi.entity.Test;
import com.example.pi.service.TestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TestController.class)
class TestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestService service;

    @Autowired
    private ObjectMapper objectMapper;

    // GET ALL
    @org.junit.jupiter.api.Test
    void shouldGetAllTests() throws Exception {

        Test t = new Test();
        t.setId(1L);
        t.setTitle("Java Test");

        when(service.getAll()).thenReturn(List.of(t));

        mockMvc.perform(get("/api/tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // GET BY FORMATION
    @org.junit.jupiter.api.Test
    void shouldGetTestsByFormation() throws Exception {

        Test t = new Test();
        t.setId(1L);

        when(service.getByFormation(1L)).thenReturn(List.of(t));

        mockMvc.perform(get("/api/tests?formationId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // GET BY ID
    @org.junit.jupiter.api.Test
    void shouldGetTestById() throws Exception {

        Test t = new Test();
        t.setId(1L);
        t.setTitle("Spring Test");

        when(service.getById(1L)).thenReturn(t);

        mockMvc.perform(get("/api/tests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // CREATE
    @org.junit.jupiter.api.Test
    void shouldCreateTest() throws Exception {

        Test input = new Test();
        input.setTitle("New Test");

        Test saved = new Test();
        saved.setId(1L);
        saved.setTitle("New Test");

        when(service.create(any(Test.class))).thenReturn(saved);

        mockMvc.perform(post("/api/tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // GENERATE
    @org.junit.jupiter.api.Test
    void shouldCreateTestWithQuestions() throws Exception {

        TestController.CreateTestRequest request = new TestController.CreateTestRequest();
        request.title = "AI Test";
        request.passingScore = 70;
        request.formationId = 1L;
        request.numberOfQuestions = 10;

        Test saved = new Test();
        saved.setId(1L);
        saved.setTitle("AI Test");

        when(service.createWithQuestions(any(Test.class), eq(10)))
                .thenReturn(saved);

        mockMvc.perform(post("/api/tests/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // UPDATE
    @org.junit.jupiter.api.Test
    void shouldUpdateTest() throws Exception {

        Test t = new Test();
        t.setTitle("Updated");

        Test updated = new Test();
        updated.setId(1L);
        updated.setTitle("Updated");

        when(service.update(eq(1L), any(Test.class))).thenReturn(updated);

        mockMvc.perform(put("/api/tests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(t)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"));
    }

    // DELETE
    @org.junit.jupiter.api.Test
    void shouldDeleteTest() throws Exception {

        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/tests/1"))
                .andExpect(status().isOk());
    }
}