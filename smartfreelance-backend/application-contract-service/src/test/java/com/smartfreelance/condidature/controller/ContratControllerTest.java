package com.smartfreelance.condidature.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.exception.ContratNotFoundException;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.service.ContratService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContratController.class)
@Import(com.smartfreelance.condidature.exception.GlobalExceptionHandler.class)
class ContratControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ContratService contratService;

    @Test
    void findAllReturnsContracts() throws Exception {
        ContratResponse response = ContratResponse.builder()
                .id(12L)
                .clientId(1L)
                .freelancerId(2L)
                .titre("Website redesign")
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();
        when(contratService.findAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/contrats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(12))
                .andExpect(jsonPath("$[0].titre").value("Website redesign"));
    }

    @Test
    void createReturnsCreatedWhenRequestIsValid() throws Exception {
        ContratRequest request = ContratRequest.builder()
                .clientId(1L)
                .freelancerId(2L)
                .titre("API development")
                .description("Build REST APIs")
                .montant(new BigDecimal("1800.00"))
                .dateDebut(LocalDate.now().plusDays(1))
                .dateFin(LocalDate.now().plusDays(15))
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();

        ContratResponse response = ContratResponse.builder()
                .id(44L)
                .clientId(1L)
                .freelancerId(2L)
                .titre("API development")
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();
        when(contratService.create(any(ContratRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/contrats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(44))
                .andExpect(jsonPath("$.titre").value("API development"));
    }

    @Test
    void findByIdReturnsNotFoundWhenMissing() throws Exception {
        when(contratService.findById(999L)).thenThrow(new ContratNotFoundException(999L));

        mockMvc.perform(get("/api/contrats/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Contrat non trouvé avec l'id: 999"));
    }
}
