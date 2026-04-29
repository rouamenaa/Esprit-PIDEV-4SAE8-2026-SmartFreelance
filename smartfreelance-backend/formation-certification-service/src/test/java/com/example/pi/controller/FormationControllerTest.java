package com.example.pi.controller;

import com.example.pi.entity.Formation;
import com.example.pi.service.FormationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FormationController.class)
class FormationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FormationService service;

    @Autowired
    private ObjectMapper objectMapper;

    // ─────────────────────────────
    // GET ALL
    // ─────────────────────────────
    @Test
    void shouldGetAllFormations() throws Exception {

        Formation f = new Formation();
        f.setId(1L);

        when(service.getAll()).thenReturn(List.of(f));

        mockMvc.perform(get("/api/formations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─────────────────────────────
    // GET BY ID
    // ─────────────────────────────
    @Test
    void shouldGetFormationById() throws Exception {

        Formation f = new Formation();
        f.setId(1L);

        when(service.getById(1L)).thenReturn(f);

        mockMvc.perform(get("/api/formations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // CREATE
    // ─────────────────────────────
    @Test
    void shouldCreateFormation() throws Exception {

        Formation input = new Formation();
        input.setId(1L);

        when(service.create(any(Formation.class))).thenReturn(input);

        mockMvc.perform(post("/api/formations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // UPDATE
    // ─────────────────────────────
    @Test
    void shouldUpdateFormation() throws Exception {

        Formation input = new Formation();
        input.setId(1L);

        when(service.update(eq(1L), any(Formation.class))).thenReturn(input);

        mockMvc.perform(put("/api/formations/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // DELETE
    // ─────────────────────────────
    @Test
    void shouldDeleteFormation() throws Exception {

        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/formations/1"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────
    // PAGED
    // ─────────────────────────────
    @Test
    void shouldGetPagedFormations() throws Exception {

        Formation f = new Formation();
        f.setId(1L);

        Page<Formation> page = new PageImpl<>(
                List.of(f),
                PageRequest.of(0, 10),
                1
        );

        when(service.getAllPaginated(anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(page);

        mockMvc.perform(get("/api/formations/paged"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    // ─────────────────────────────
    // SEARCH
    // ─────────────────────────────
    @Test
    void shouldSearchFormations() throws Exception {

        Formation f = new Formation();
        f.setId(1L);

        Page<Formation> page = new PageImpl<>(
                List.of(f),
                PageRequest.of(0, 10),
                1
        );

        when(service.searchFormations(
                any(), any(), any(), any(),
                anyInt(), anyInt(), anyString(), anyString()
        )).thenReturn(page);

        mockMvc.perform(get("/api/formations/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }
}