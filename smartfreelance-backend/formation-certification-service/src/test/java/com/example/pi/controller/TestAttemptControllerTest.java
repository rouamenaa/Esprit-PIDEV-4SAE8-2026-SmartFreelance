package com.example.pi.controller;

import com.example.pi.dto.SubmitRequest;
import com.example.pi.entity.TestAttempt;
import com.example.pi.service.TestAttemptService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TestAttemptController.class)
class TestAttemptControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestAttemptService testAttemptService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submit_shouldReturnTestAttempt() throws Exception {
        // Given
        Long testId = 1L;
        SubmitRequest request = new SubmitRequest();
        request.setUserId(5L);
        request.setAnswers(Map.of(10L, 100L));

        TestAttempt attempt = new TestAttempt();
        attempt.setId(100L);
        attempt.setScore(10);
        attempt.setTotalPoints(10);
        attempt.setPassed(true);
        attempt.setAttemptDate(LocalDateTime.now());
        attempt.setUserId(5L);
        attempt.setUserName("john");

        when(testAttemptService.submit(eq(testId), any(SubmitRequest.class))).thenReturn(attempt);

        // When & Then
        mockMvc.perform(post("/api/attempts/submit/{testId}", testId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.score").value(10))
                .andExpect(jsonPath("$.passed").value(true))
                .andExpect(jsonPath("$.userName").value("john"));
    }

    @Test
    void getAll_shouldReturnList() throws Exception {
        TestAttempt attempt1 = new TestAttempt();
        attempt1.setId(1L);
        TestAttempt attempt2 = new TestAttempt();
        attempt2.setId(2L);

        when(testAttemptService.getAll()).thenReturn(List.of(attempt1, attempt2));

        mockMvc.perform(get("/api/attempts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void getByTest_shouldReturnAttempts() throws Exception {
        Long testId = 10L;
        TestAttempt attempt = new TestAttempt();
        attempt.setId(5L);
        when(testAttemptService.getByTest(testId)).thenReturn(List.of(attempt));

        mockMvc.perform(get("/api/attempts/test/{testId}", testId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(5));
    }

    @Test
    void getById_shouldReturnAttempt() throws Exception {
        Long attemptId = 42L;
        TestAttempt attempt = new TestAttempt();
        attempt.setId(attemptId);
        when(testAttemptService.getById(attemptId)).thenReturn(attempt);

        mockMvc.perform(get("/api/attempts/{id}", attemptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        Long attemptId = 99L;
        mockMvc.perform(delete("/api/attempts/{id}", attemptId))
                .andExpect(status().isOk());  // retour void -> status 200 OK
    }
}