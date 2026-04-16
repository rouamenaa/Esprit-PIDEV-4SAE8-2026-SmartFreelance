package com.example.pi.controller;

import com.example.pi.entity.Reward;
import com.example.pi.service.RewardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RewardController.class)
class RewardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RewardService service;

    @Autowired
    private ObjectMapper objectMapper;

    // ─────────────────────────────
    // GET ALL
    // ─────────────────────────────
    @Test
    void shouldGetAllRewards() throws Exception {

        Reward r = new Reward();
        r.setId(1L);

        when(service.getAll()).thenReturn(List.of(r));

        mockMvc.perform(get("/api/rewards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─────────────────────────────
    // GET BY FORMATION
    // ─────────────────────────────
    @Test
    void shouldGetRewardsByFormation() throws Exception {

        Reward r = new Reward();
        r.setId(1L);

        when(service.getByFormation(1L)).thenReturn(List.of(r));

        mockMvc.perform(get("/api/rewards?formationId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─────────────────────────────
    // GET BY ID
    // ─────────────────────────────
    @Test
    void shouldGetRewardById() throws Exception {

        Reward r = new Reward();
        r.setId(1L);

        when(service.getById(1L)).thenReturn(r);

        mockMvc.perform(get("/api/rewards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // CREATE
    // ─────────────────────────────
    @Test
    void shouldCreateReward() throws Exception {

        Reward input = new Reward();
        input.setId(1L);

        Reward saved = new Reward();
        saved.setId(1L);

        when(service.create(any(Reward.class))).thenReturn(saved);

        mockMvc.perform(post("/api/rewards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // UPDATE
    // ─────────────────────────────
    @Test
    void shouldUpdateReward() throws Exception {

        Reward input = new Reward();
        input.setId(1L);

        Reward updated = new Reward();
        updated.setId(1L);

        when(service.update(eq(1L), any(Reward.class))).thenReturn(updated);

        mockMvc.perform(put("/api/rewards/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // DELETE
    // ─────────────────────────────
    @Test
    void shouldDeleteReward() throws Exception {

        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/rewards/1"))
                .andExpect(status().isOk());
    }
}