package com.example.pi.controller;

import com.example.pi.client.CalendarClient;
import com.example.pi.dto.CalendarApiStatusDTO;
import com.example.pi.dto.CalendarSyncRequestDTO;
import com.example.pi.dto.CalendarSyncResultDTO;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private static final Logger log = LoggerFactory.getLogger(CalendarController.class);

    private final CalendarClient calendarClient;

    public CalendarController(CalendarClient calendarClient) {
        this.calendarClient = calendarClient;
    }

    private CircuitBreaker getCircuitBreaker() {
        CircuitBreaker cb = calendarClient.getCircuitBreaker();
        if (cb == null) {
            throw new IllegalStateException("CircuitBreaker not initialized in CalendarClient");
        }
        return cb;
    }

    /**
     * GET /api/calendar/health
     * Returns UP directly — Calendar is internal, no external call needed.
     */
    @GetMapping("/health")
    public ResponseEntity<CalendarApiStatusDTO> checkHealth() {
        log.info("Calendar health check requested");

        CalendarApiStatusDTO status = new CalendarApiStatusDTO();
        status.setAvailable(true);
        status.setStatus("UP");
        status.setMessage("Calendar service is running (internal to formation-service)");
        status.setCircuitBreakerState(getCircuitBreaker().getState().toString());
        status.setCalendarApiUrl("internal://formation-service/calendar");

        log.info("Calendar health check: UP (circuit: {})", getCircuitBreaker().getState());
        return ResponseEntity.ok(status);
    }

    /**
     * POST /api/calendar/test-sync
     * Test the Calendar sync for a given formation and email.
     */
    @PostMapping("/test-sync")
    public ResponseEntity<CalendarSyncResultDTO> testSync(@Valid @RequestBody CalendarSyncRequestDTO request) {
        log.info("Calendar test-sync: formationId={}, email={}", request.getFormationId(), request.getParticipantEmail());

        CalendarSyncResultDTO result = new CalendarSyncResultDTO();
        result.setFormationId(request.getFormationId());
        result.setParticipantEmail(request.getParticipantEmail());

        try {
            String syncStatus = calendarClient.syncRegistration(
                    request.getFormationId(),
                    request.getParticipantEmail()
            );

            result.setSyncStatus(syncStatus);
            result.setMessage("SYNC_OK".equals(syncStatus)
                    ? "Calendar sync successful"
                    : "Calendar sync failed (circuit open or internal error)");

            log.info("Calendar test-sync result: {}", syncStatus);

        } catch (Exception ex) {
            result.setSyncStatus("ERROR");
            result.setMessage("Unexpected error: " + ex.getMessage());
            log.error("Calendar test-sync ERROR", ex);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/calendar/circuit-breaker
     * Get circuit breaker metrics.
     */
    @GetMapping("/circuit-breaker")
    public ResponseEntity<Map<String, Object>> getCircuitBreakerStatus() {
        CircuitBreaker cb = getCircuitBreaker();

        Map<String, Object> metrics = Map.of(
                "state", cb.getState().toString(),
                "name", cb.getName(),
                "metrics", Map.of(
                        "failureRate", cb.getMetrics().getFailureRate(),
                        "numberOfFailedCalls", cb.getMetrics().getNumberOfFailedCalls(),
                        "numberOfSuccessfulCalls", cb.getMetrics().getNumberOfSuccessfulCalls(),
                        "numberOfNotPermittedCalls", cb.getMetrics().getNumberOfNotPermittedCalls()
                )
        );

        return ResponseEntity.ok(metrics);
    }

    /**
     * GET /api/calendar/config
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = Map.of(
                "calendarApiUrl", "internal://formation-service/calendar",
                "circuitBreakerState", getCircuitBreaker().getState().toString()
        );

        return ResponseEntity.ok(config);
    }
}