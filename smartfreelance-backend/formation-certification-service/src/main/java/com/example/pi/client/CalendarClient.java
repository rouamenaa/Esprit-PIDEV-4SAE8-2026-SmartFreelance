package com.example.pi.client;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.function.Supplier;

@Component
public class CalendarClient {

    private static final Logger log = LoggerFactory.getLogger(CalendarClient.class);

    private final CircuitBreaker circuitBreaker;

    public CalendarClient() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slidingWindowSize(5)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(2)
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
        this.circuitBreaker = registry.circuitBreaker("calendarApi");
    }

    @PostConstruct
    public void init() {
        log.info("CalendarClient initialized (internal mode)");
        log.info("CircuitBreaker '{}' initial state: {}", circuitBreaker.getName(), circuitBreaker.getState());
    }

    public CircuitBreaker getCircuitBreaker() {
        return circuitBreaker;
    }

    /**
     * Sync a registration with the calendar.
     * Calendar is internal to formation-service — no HTTP call needed.
     */
    public String syncRegistration(Long formationId, String participantEmail) {
        Supplier<String> decoratedSupplier = CircuitBreaker.decorateSupplier(circuitBreaker, () -> {
            log.info("Calendar sync - formationId: {}, email: {}", formationId, participantEmail);

            // ✅ Internal logic — no HTTP self-call
            // Add your real calendar business logic here if needed
            // e.g. save to DB, send email, create event, etc.

            log.info("Calendar sync successful - formationId: {}, email: {}", formationId, participantEmail);
            return "SYNC_OK";
        });

        try {
            return decoratedSupplier.get();
        } catch (Exception ex) {
            log.warn("Calendar sync failed - formation={}, email={}, circuit={}, error={}",
                    formationId, participantEmail, circuitBreaker.getState(), ex.getMessage());
            return "SYNC_FAILED";
        }
    }
}