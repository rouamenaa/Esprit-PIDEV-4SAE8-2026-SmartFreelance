package com.example.pi.controller;

import com.example.pi.dto.ParticipantRequestDTO;
import com.example.pi.dto.ParticipantResponseDTO;
import com.example.pi.service.ParticipantService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ParticipantController.class)
class ParticipantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParticipantService participantService;

    @Autowired
    private ObjectMapper objectMapper;

    // ─────────────────────────────
    // REGISTER PARTICIPANT
    // ─────────────────────────────
    @Test
    void shouldRegisterParticipant() throws Exception {

        ParticipantRequestDTO request = new ParticipantRequestDTO();
        request.setFullName("John Doe");
        request.setEmail("john@test.com");

        ParticipantResponseDTO response = new ParticipantResponseDTO();
        response.setId(1L);
        response.setFullName("John Doe");
        response.setEmail("john@test.com");
        response.setStatus("REGISTERED");

        when(participantService.registerParticipant(eq(1L), any(ParticipantRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/formations/1/participants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.status").value("REGISTERED"));
    }

    // ─────────────────────────────
    // CANCEL PARTICIPATION
    // ─────────────────────────────
    @Test
    void shouldCancelParticipant() throws Exception {

        ParticipantResponseDTO response = new ParticipantResponseDTO();
        response.setId(1L);
        response.setStatus("CANCELLED");

        when(participantService.cancelRegistration(1L, 1L))
                .thenReturn(response);

        mockMvc.perform(delete("/api/formations/1/participants/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ─────────────────────────────
    // LIST PARTICIPANTS
    // ─────────────────────────────
    @Test
    void shouldListParticipants() throws Exception {

        ParticipantResponseDTO p = new ParticipantResponseDTO();
        p.setId(1L);
        p.setFullName("John Doe");

        when(participantService.getParticipantsByFormation(1L))
                .thenReturn(List.of(p));

        mockMvc.perform(get("/api/formations/1/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("John Doe"));
    }
}