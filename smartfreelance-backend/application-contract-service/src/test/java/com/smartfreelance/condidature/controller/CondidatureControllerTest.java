package com.smartfreelance.condidature.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.condidature.dto.CondidatureDTO;
import com.smartfreelance.condidature.dto.CondidatureRequestDTO;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import com.smartfreelance.condidature.service.CondidatureService;
import com.smartfreelance.condidature.service.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CondidatureController.class)
class CondidatureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CondidatureService condidatureService;

    @Test
    void getAllWithProjectAndStatusDelegatesToFilteredService() throws Exception {
        CondidatureDTO dto = new CondidatureDTO();
        dto.setId(10L);
        dto.setProjectId(100L);
        dto.setFreelancerId(200L);
        dto.setStatus(CondidatureStatus.PENDING);
        when(condidatureService.findByProjectIdAndStatus(100L, CondidatureStatus.PENDING))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/condidatures")
                        .param("projectId", "100")
                        .param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void createReturnsCreatedWhenPayloadIsValid() throws Exception {
        CondidatureRequestDTO request = CondidatureRequestDTO.builder()
                .projectId(101L)
                .freelancerId(202L)
                .coverLetter("Motivated freelancer")
                .proposedPrice(500.0)
                .estimatedDeliveryDays(10)
                .build();

        CondidatureDTO response = new CondidatureDTO();
        response.setId(1L);
        response.setProjectId(101L);
        response.setFreelancerId(202L);
        response.setStatus(CondidatureStatus.PENDING);
        when(condidatureService.create(any(CondidatureRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/condidatures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void deleteReturnsNotFoundWhenEntityDoesNotExist() throws Exception {
        doThrow(new ResourceNotFoundException("Condidature not found with id: 999"))
                .when(condidatureService).deleteById(999L);

        mockMvc.perform(delete("/api/condidatures/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Condidature not found with id: 999"));
    }
}
