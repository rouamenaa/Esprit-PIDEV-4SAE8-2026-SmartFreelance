package com.example.pi.client;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Calls an external calendar API to register formation events.
 * Uses Resilience4j CircuitBreaker – if the API is unavailable the circuit
 * opens and the fallback returns "SYNC_FAILED" without rolling back the registration.
 */
@Component
public class CalendarClient {

    private static final Logger log = LoggerFactory.getLogger(CalendarClient.class);

    private final RestTemplate restTemplate;
    private final CircuitBreaker circuitBreaker;

    @Value("${calendar.api.url:http://localhost:9999/calendar/events}")
    private String calendarApiUrl;

    public CalendarClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slidingWindowSize(5)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(2)
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
        this.circuitBreaker = registry.circuitBreaker("calendarApi");
    }

    /**
     * Sends a registration event to the calendar API.
     *
     * @param formationId  the formation id
     * @param participantEmail the participant email
     * @return "SYNC_OK" on success, "SYNC_FAILED" on any error
     */
    public String syncRegistration(Long formationId, String participantEmail) {
        Supplier<String> decoratedSupplier = CircuitBreaker.decorateSupplier(circuitBreaker, () -> {
            Map<String, Object> payload = Map.of(
                    "formationId", formationId,
                    "participantEmail", participantEmail,
                    "eventType", "REGISTRATION"
            );
            restTemplate.postForObject(calendarApiUrl, payload, Void.class);
            return "SYNC_OK";
        });

        try {
            return decoratedSupplier.get();
        } catch (Exception ex) {
            log.warn("Calendar API sync failed for formation={}, email={}: {}",
                    formationId, participantEmail, ex.getMessage());
            return "SYNC_FAILED";
        }
    }
}
