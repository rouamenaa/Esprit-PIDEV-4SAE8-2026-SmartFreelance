package com.example.pi.integration;

import com.example.pi.client.CalendarClient;
import com.example.pi.dto.CalendarSyncRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalendarControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CalendarClient calendarClient;

    // Mock du CircuitBreaker pour éviter les nulls
    private final CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("test");

    @Test
    void shouldReturnHealthStatus() throws Exception {
        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);

        mockMvc.perform(get("/api/calendar/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void shouldReturnConfig() throws Exception {
        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);

        mockMvc.perform(get("/api/calendar/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calendarApiUrl").value("internal://formation-service/calendar"));
    }

    @Test
    void shouldReturnCircuitBreakerStatus() throws Exception {
        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);

        mockMvc.perform(get("/api/calendar/circuit-breaker"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldTestCalendarSync() throws Exception {
        CalendarSyncRequestDTO request = new CalendarSyncRequestDTO();
        request.setFormationId(1L);
        request.setParticipantEmail("test@mail.com");

        when(calendarClient.syncRegistration(1L, "test@mail.com"))
                .thenReturn("SYNC_OK");

        mockMvc.perform(post("/api/calendar/test-sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.syncStatus").value("SYNC_OK"))
                .andExpect(jsonPath("$.message").value("Calendar sync successful"));
    }
}