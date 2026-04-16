package com.example.pi.integration;

import com.example.pi.dto.SubmitRequest;
import com.example.pi.entity.TestAttempt;
import com.example.pi.service.TestAttemptService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TestAttemptControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestAttemptService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submit_shouldReturnAttempt() throws Exception {

        SubmitRequest request = new SubmitRequest();
        TestAttempt attempt = new TestAttempt();

        when(service.submit(any(Long.class), any(SubmitRequest.class)))
                .thenReturn(attempt);

        mockMvc.perform(post("/api/attempts/submit/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getAll_shouldReturnList() throws Exception {

        when(service.getAll()).thenReturn(List.of(new TestAttempt()));

        mockMvc.perform(get("/api/attempts"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getByTest_shouldReturnList() throws Exception {

        when(service.getByTest(1L)).thenReturn(List.of(new TestAttempt()));

        mockMvc.perform(get("/api/attempts/test/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getById_shouldReturnAttempt() throws Exception {

        when(service.getById(1L)).thenReturn(new TestAttempt());

        mockMvc.perform(get("/api/attempts/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void delete_shouldReturnOk() throws Exception {

        mockMvc.perform(delete("/api/attempts/1"))
                .andExpect(status().isOk());
    }
}