package com.example.pi.integration;

import com.example.pi.controller.StatisticsController;
import com.example.pi.dto.FormationStatisticsDTO;
import com.example.pi.dto.GlobalStatisticsDTO;
import com.example.pi.dto.MonthlyRegistrationDTO;
import com.example.pi.service.StatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class StatisticsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    @Test
    void global_shouldReturnStatistics() throws Exception {

        GlobalStatisticsDTO dto = new GlobalStatisticsDTO();

        when(statisticsService.getGlobalStatistics()).thenReturn(dto);

        mockMvc.perform(get("/api/formations/statistics/global"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void byFormation_shouldReturnFormationStatistics() throws Exception {

        FormationStatisticsDTO dto = new FormationStatisticsDTO();

        when(statisticsService.getFormationStatistics(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/formations/statistics/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void monthly_shouldReturnListOfMonthlyStats() throws Exception {

        List<MonthlyRegistrationDTO> list =
                List.of(new MonthlyRegistrationDTO("2026-04", 10L));

        when(statisticsService.getMonthlyRegistrations()).thenReturn(list);

        mockMvc.perform(get("/api/formations/statistics/monthly"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
}