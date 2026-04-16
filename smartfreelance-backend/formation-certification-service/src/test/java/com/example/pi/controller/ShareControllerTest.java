package com.example.pi.controller;

import com.example.pi.entity.Formation;
import com.example.pi.service.FormationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShareController.class)
class ShareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FormationService formationService;

    // ─────────────────────────────
    // SUCCESS CASE
    // ─────────────────────────────
    @Test
    void shouldReturnHtmlForFormationShare() throws Exception {

        Formation formation = new Formation();
        formation.setId(1L);
        formation.setTitle("Java Spring Boot");
        formation.setDescription("Learn Spring Boot deeply");

        when(formationService.getById(1L)).thenReturn(formation);

        mockMvc.perform(get("/share/formation/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Java Spring Boot")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Learn Spring Boot deeply")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("og:title")));
    }

    // ─────────────────────────────
    // FORMATION NOT FOUND
    // ─────────────────────────────
    @Test
    void shouldThrowExceptionWhenFormationNotFound() throws Exception {

        when(formationService.getById(1L)).thenReturn(null);

        mockMvc.perform(get("/share/formation/1"))
                .andExpect(status().isInternalServerError());
    }
}