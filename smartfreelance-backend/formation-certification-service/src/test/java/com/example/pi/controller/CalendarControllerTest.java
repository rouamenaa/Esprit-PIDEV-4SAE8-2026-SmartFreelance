package com.example.pi.controller;

import com.example.pi.client.CalendarClient;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalendarController.class)
class CalendarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CalendarClient calendarClient;

    // mock circuit breaker
    @MockBean
    private CircuitBreaker circuitBreaker;

    // ─────────────────────────────
    // HEALTH
    // ─────────────────────────────
    @Test
    void shouldReturnHealthStatus() throws Exception {

        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);
        when(circuitBreaker.getState()).thenReturn(CircuitBreaker.State.CLOSED);

        mockMvc.perform(get("/api/calendar/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.available").value(true));
    }

    // ─────────────────────────────
    // TEST SYNC SUCCESS
    // ─────────────────────────────
    @Test
    void shouldSyncCalendarSuccessfully() throws Exception {

        when(calendarClient.syncRegistration(1L, "test@mail.com"))
                .thenReturn("SYNC_OK");

        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);
        when(circuitBreaker.getState()).thenReturn(CircuitBreaker.State.CLOSED);

        String body = """
        {
          "formationId": 1,
          "participantEmail": "test@mail.com"
        }
        """;

        mockMvc.perform(post("/api/calendar/test-sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.syncStatus").value("SYNC_OK"))
                .andExpect(jsonPath("$.message").value("Calendar sync successful"));
    }

    // ─────────────────────────────
    // CIRCUIT BREAKER STATUS
    // ─────────────────────────────
    @Test
    void shouldReturnCircuitBreakerStatus() throws Exception {

        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);
        when(circuitBreaker.getState()).thenReturn(CircuitBreaker.State.CLOSED);
        when(circuitBreaker.getName()).thenReturn("calendarApi");

        var metrics = mock(io.github.resilience4j.circuitbreaker.CircuitBreaker.Metrics.class);

        when(circuitBreaker.getMetrics()).thenReturn(metrics);
        when(metrics.getFailureRate()).thenReturn(0.0f);
        when(metrics.getNumberOfFailedCalls()).thenReturn(0);
        when(metrics.getNumberOfSuccessfulCalls()).thenReturn(5);
        when(metrics.getNumberOfNotPermittedCalls()).thenReturn(0L);

        mockMvc.perform(get("/api/calendar/circuit-breaker"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("CLOSED"))
                .andExpect(jsonPath("$.name").value("calendarApi"));
    }

    // ─────────────────────────────
    // CONFIG
    // ─────────────────────────────
    @Test
    void shouldReturnConfig() throws Exception {

        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);
        when(circuitBreaker.getState()).thenReturn(CircuitBreaker.State.CLOSED);

        mockMvc.perform(get("/api/calendar/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calendarApiUrl").value("internal://formation-service/calendar"));
    }
}