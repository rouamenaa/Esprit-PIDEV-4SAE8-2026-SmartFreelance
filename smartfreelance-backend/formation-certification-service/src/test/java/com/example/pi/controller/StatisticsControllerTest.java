package com.example.pi.controller;

import com.example.pi.dto.FormationStatisticsDTO;
import com.example.pi.dto.GlobalStatisticsDTO;
import com.example.pi.dto.MonthlyRegistrationDTO;
import com.example.pi.service.StatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatisticsController.class)
class StatisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    // ─────────────────────────────
    // GLOBAL STATISTICS
    // ─────────────────────────────
    @Test
    void shouldReturnGlobalStatistics() throws Exception {

        GlobalStatisticsDTO dto = new GlobalStatisticsDTO();

        when(statisticsService.getGlobalStatistics()).thenReturn(dto);

        mockMvc.perform(get("/api/formations/statistics/global"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────
    // BY FORMATION
    // ─────────────────────────────
    @Test
    void shouldReturnFormationStatistics() throws Exception {

        FormationStatisticsDTO dto = new FormationStatisticsDTO();

        when(statisticsService.getFormationStatistics(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/formations/statistics/1"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────
    // MONTHLY REGISTRATIONS
    // ─────────────────────────────
    @Test
    void shouldReturnMonthlyStatistics() throws Exception {

        MonthlyRegistrationDTO m =
                new MonthlyRegistrationDTO("2026-04", 10L);

        when(statisticsService.getMonthlyRegistrations())
                .thenReturn(List.of(m));

        mockMvc.perform(get("/api/formations/statistics/monthly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}