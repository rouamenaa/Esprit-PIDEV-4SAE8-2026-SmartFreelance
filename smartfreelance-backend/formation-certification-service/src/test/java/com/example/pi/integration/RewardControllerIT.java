package com.example.pi.integration;

import com.example.pi.entity.Reward;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RewardControllerIT {

    @Autowired
    private TestRestTemplate restTemplate;

    // =====================
    // GET ALL
    // =====================
    @Test
    void shouldGetAllRewards() {

        ResponseEntity<Reward[]> response =
                restTemplate.getForEntity("/api/rewards", Reward[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =====================
    // GET BY ID
    // =====================
    @Test
    void shouldGetRewardById() {

        Long id = 1L;

        ResponseEntity<Reward> response =
                restTemplate.getForEntity("/api/rewards/" + id, Reward.class);

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

    // =====================
    // CREATE
    // =====================
    @Test
    void shouldCreateReward() {

        Reward r = new Reward();
        r.setName("Test Reward");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Reward> request = new HttpEntity<>(r, headers);

        ResponseEntity<Reward> response =
                restTemplate.postForEntity("/api/rewards", request, Reward.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =====================
    // UPDATE
    // =====================
    @Test
    void shouldUpdateReward() {

        Long id = 1L;

        Reward r = new Reward();
        r.setName("Updated Reward");

        HttpEntity<Reward> request = new HttpEntity<>(r);

        ResponseEntity<Reward> response =
                restTemplate.exchange(
                        "/api/rewards/" + id,
                        HttpMethod.PUT,
                        request,
                        Reward.class
                );

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

    // =====================
    // DELETE
    // =====================
    @Test
    void shouldDeleteReward() {

        Long id = 1L;

        ResponseEntity<Void> response =
                restTemplate.exchange(
                        "/api/rewards/" + id,
                        HttpMethod.DELETE,
                        null,
                        Void.class
                );

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NO_CONTENT ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

    // =====================
    // FILTER BY FORMATION
    // =====================
    @Test
    void shouldGetRewardsByFormation() {

        Long formationId = 1L;

        ResponseEntity<Reward[]> response =
                restTemplate.getForEntity(
                        "/api/rewards?formationId=" + formationId,
                        Reward[].class
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}