package com.example.pi.controller;

import com.example.pi.client.CalendarClient;
import com.example.pi.dto.CalendarApiStatusDTO;
import com.example.pi.dto.CalendarSyncRequestDTO;
import com.example.pi.dto.CalendarSyncResultDTO;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CalendarController.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CalendarControllerTest {

    @Mock
    private CalendarClient calendarClient;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private CircuitBreaker circuitBreaker;

    private CalendarController calendarController;

    @BeforeEach
    void setUp() {
        calendarController = new CalendarController(calendarClient, restTemplate);
        ReflectionTestUtils.setField(calendarController, "calendarApiUrl", "http://localhost:9999/calendar/events");

        when(calendarClient.getCircuitBreaker()).thenReturn(circuitBreaker);
        when(circuitBreaker.getState()).thenReturn(CircuitBreaker.State.CLOSED);
        when(circuitBreaker.getName()).thenReturn("calendarApi");
    }

    @Test
    void checkHealth_ApiUp_ReturnsAvailableStatus() {
        // Given
        ResponseEntity<String> mockResponse = new ResponseEntity<>("OK", HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(String.class))).thenReturn(mockResponse);

        // When
        ResponseEntity<CalendarApiStatusDTO> response = calendarController.checkHealth();

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isAvailable());
        assertEquals("UP", response.getBody().getStatus());
    }

    @Test
    void checkHealth_ApiDown_ReturnsUnavailableStatus() {
        // Given
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        // When
        ResponseEntity<CalendarApiStatusDTO> response = calendarController.checkHealth();

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isAvailable());
        assertEquals("DOWN", response.getBody().getStatus());
    }

    @Test
    void testSync_Success_ReturnsSyncOkResult() {
        // Given
        CalendarSyncRequestDTO request = new CalendarSyncRequestDTO();
        request.setFormationId(1L);
        request.setParticipantEmail("test@example.com");

        when(calendarClient.syncRegistration(1L, "test@example.com")).thenReturn("SYNC_OK");

        // When
        ResponseEntity<CalendarSyncResultDTO> response = calendarController.testSync(request);

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("SYNC_OK", response.getBody().getSyncStatus());
        assertTrue(response.getBody().getMessage().contains("successful"));
    }

    @Test
    void testSync_Failure_ReturnsSyncFailedResult() {
        // Given
        CalendarSyncRequestDTO request = new CalendarSyncRequestDTO();
        request.setFormationId(1L);
        request.setParticipantEmail("test@example.com");

        when(calendarClient.syncRegistration(1L, "test@example.com")).thenReturn("SYNC_FAILED");

        // When
        ResponseEntity<CalendarSyncResultDTO> response = calendarController.testSync(request);

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("SYNC_FAILED", response.getBody().getSyncStatus());
        assertTrue(response.getBody().getMessage().contains("failed"));
    }

    @Test
    void getCircuitBreakerStatus_ReturnsMetrics() {
        // Given
        CircuitBreaker.Metrics metrics = mock(CircuitBreaker.Metrics.class);
        when(circuitBreaker.getMetrics()).thenReturn(metrics);
        when(metrics.getFailureRate()).thenReturn(0.0f);
        when(metrics.getNumberOfFailedCalls()).thenReturn(0);
        when(metrics.getNumberOfSuccessfulCalls()).thenReturn(5);
        when(metrics.getNumberOfNotPermittedCalls()).thenReturn(0L);

        // When
        ResponseEntity<Map<String, Object>> response = calendarController.getCircuitBreakerStatus();

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("state"));
        assertTrue(response.getBody().containsKey("name"));
        assertTrue(response.getBody().containsKey("metrics"));
    }

    @Test
    void getConfig_ReturnsConfiguration() {
        // When
        ResponseEntity<Map<String, String>> response = calendarController.getConfig();

        // Then
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("calendarApiUrl"));
        assertTrue(response.getBody().containsKey("circuitBreakerState"));
    }
}
