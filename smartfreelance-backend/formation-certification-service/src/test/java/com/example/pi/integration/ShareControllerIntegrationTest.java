package com.example.pi.integration;

import com.example.pi.entity.Formation;
import com.example.pi.service.FormationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ShareControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FormationService formationService;

    @Test
    void shareFormation_shouldReturnHtmlWithOgTags() throws Exception {

        // Arrange
        Formation formation = new Formation();
        formation.setId(1L);
        formation.setTitle("Spring Boot");
        formation.setDescription("Formation test");

        when(formationService.getById(1L)).thenReturn(formation);

        // Act & Assert
        mockMvc.perform(get("/share/formation/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("og:title")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Spring Boot")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Formation test")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("og:description")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("og:url")));
    }

    @Test
    void shareFormation_shouldReturn404LikeBehavior_whenFormationNotFound() throws Exception {

        when(formationService.getById(99L)).thenReturn(null);

        mockMvc.perform(get("/share/formation/99"))
                .andExpect(status().is5xxServerError()); // ton controller lance RuntimeException
    }
}