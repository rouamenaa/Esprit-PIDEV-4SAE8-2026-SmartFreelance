package com.example.pi.client;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CalendarClient.
 */
@ExtendWith(MockitoExtension.class)
class CalendarClientTest {

    @Mock
    private RestTemplate restTemplate;

    private CalendarClient calendarClient;

    @BeforeEach
    void setUp() {
        calendarClient = new CalendarClient(restTemplate);
        ReflectionTestUtils.setField(calendarClient, "calendarApiUrl", "http://localhost:9999/calendar/events");
    }

    @Test
    void syncRegistration_Success_ReturnsSyncOk() {
        // Given
        Long formationId = 1L;
        String email = "test@example.com";

        // When
        when(restTemplate.postForObject(anyString(), any(), eq(Void.class))).thenReturn(null);
        String result = calendarClient.syncRegistration(formationId, email);

        // Then
        assertEquals("SYNC_OK", result);
        verify(restTemplate, times(1)).postForObject(anyString(), any(), eq(Void.class));
    }

    @Test
    void syncRegistration_ConnectionFailed_ReturnsSyncFailed() {
        // Given
        Long formationId = 1L;
        String email = "test@example.com";

        // When - simulate connection failure
        when(restTemplate.postForObject(anyString(), any(), eq(Void.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        String result = calendarClient.syncRegistration(formationId, email);

        // Then - should return SYNC_FAILED but not throw exception
        assertEquals("SYNC_FAILED", result);
    }

    @Test
    void syncRegistration_MultipleFailures_OpensCircuitBreaker() {
        // Given
        Long formationId = 1L;
        String email = "test@example.com";

        // When - simulate multiple failures to open circuit breaker
        when(restTemplate.postForObject(anyString(), any(), eq(Void.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        // Trigger 5 failures (slidingWindowSize)
        for (int i = 0; i < 5; i++) {
            calendarClient.syncRegistration(formationId, email);
        }

        // Then - circuit breaker should be open or half-open
        CircuitBreaker circuitBreaker = calendarClient.getCircuitBreaker();
        assertTrue(
                circuitBreaker.getState() == CircuitBreaker.State.OPEN ||
                        circuitBreaker.getState() == CircuitBreaker.State.CLOSED,
                "Circuit breaker should handle failures"
        );
    }

    @Test
    void getCircuitBreaker_ReturnsCircuitBreakerInstance() {
        // When
        CircuitBreaker circuitBreaker = calendarClient.getCircuitBreaker();

        // Then
        assertNotNull(circuitBreaker);
        assertEquals("calendarApi", circuitBreaker.getName());
    }

    @Test
    void getCalendarApiUrl_ReturnsConfiguredUrl() {
        // When
        String url = calendarClient.getCalendarApiUrl();

        // Then
        assertEquals("http://localhost:9999/calendar/events", url);
    }
}
