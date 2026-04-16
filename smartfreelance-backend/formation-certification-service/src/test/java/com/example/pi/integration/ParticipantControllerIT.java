package com.example.pi.integration;

import com.example.pi.dto.ParticipantRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ParticipantControllerIT {

    @Autowired
    private TestRestTemplate restTemplate;

    // =========================
    // REGISTER PARTICIPANT
    // =========================
    @Test
    void shouldRegisterParticipant() {

        Long formationId = 1L;

        ParticipantRequestDTO dto = new ParticipantRequestDTO();
        dto.setEmail("test@mail.com");
        dto.setFullName("Test User");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ParticipantRequestDTO> request =
                new HttpEntity<>(dto, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "/api/formations/" + formationId + "/participants",
                        request,
                        String.class
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =========================
    // GET PARTICIPANTS LIST
    // =========================
    @Test
    void shouldGetParticipantsList() {

        Long formationId = 1L;

        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/formations/" + formationId + "/participants",
                        String.class
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =========================
    // CANCEL PARTICIPATION
    // =========================
    @Test
    void shouldCancelParticipant() {

        Long formationId = 1L;
        Long participantId = 1L;

        ResponseEntity<String> response =
                restTemplate.exchange(
                        "/api/formations/" + formationId + "/participants/" + participantId,
                        HttpMethod.DELETE,
                        null,
                        String.class
                );

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }
}