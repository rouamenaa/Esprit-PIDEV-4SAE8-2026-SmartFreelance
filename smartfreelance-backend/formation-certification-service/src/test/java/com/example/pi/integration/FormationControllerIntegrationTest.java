package com.example.pi.controller;

import com.example.pi.entity.Formation;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FormationControllerIT {

    @Autowired
    private TestRestTemplate restTemplate;

    // =========================
    // GET ALL
    // =========================
    @Test
    void shouldGetAllFormations() {

        ResponseEntity<Formation[]> response =
                restTemplate.getForEntity("/api/formations", Formation[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =========================
    // GET BY ID
    // =========================
    @Test
    void shouldGetFormationById() {

        // ⚠️ adapte l'id selon ta DB
        Long id = 1L;

        ResponseEntity<Formation> response =
                restTemplate.getForEntity("/api/formations/" + id, Formation.class);

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

    // =========================
    // CREATE FORMATION
    // =========================
    @Test
    void shouldCreateFormation() {

        Formation f = new Formation();
        f.setTitle("Formation Integration Test");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Formation> request = new HttpEntity<>(f, headers);

        ResponseEntity<Formation> response =
                restTemplate.postForEntity("/api/formations", request, Formation.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
    }

    // =========================
    // UPDATE FORMATION
    // =========================
    @Test
    void shouldUpdateFormation() {

        Long id = 1L;

        Formation f = new Formation();
        f.setTitle("Updated Formation");

        HttpEntity<Formation> request = new HttpEntity<>(f);

        ResponseEntity<Formation> response =
                restTemplate.exchange(
                        "/api/formations/" + id,
                        HttpMethod.PUT,
                        request,
                        Formation.class
                );

        assertTrue(
                response.getStatusCode() == HttpStatus.OK ||
                        response.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

    // =========================
    // DELETE FORMATION
    // =========================
    @Test
    void shouldDeleteFormation() {

        Long id = 1L;

        ResponseEntity<Void> response =
                restTemplate.exchange(
                        "/api/formations/" + id,
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

    // =========================
    // PAGINATION ENDPOINT
    // =========================
    @Test
    void shouldGetPagedFormations() {

        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/formations/paged?page=0&size=5",
                        String.class
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // =========================
    // SEARCH ENDPOINT
    // =========================
    @Test
    void shouldSearchFormations() {

        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/formations/search?title=test&page=0&size=5",
                        String.class
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}