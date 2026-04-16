package com.example.pi.integration;

import com.example.pi.entity.Course;
import com.example.pi.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CourseService courseService;

    @Test
    void shouldGetAllCourses() throws Exception {
        Course c = new Course();
        c.setId(1L);
        c.setTitle("Spring Boot");

        when(courseService.getAll()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Spring Boot"));
    }

    @Test
    void shouldGetCourseById() throws Exception {
        Course c = new Course();
        c.setId(1L);
        c.setTitle("Java");

        when(courseService.getById(1L)).thenReturn(c);

        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Java"));
    }

    @Test
    void shouldCreateCourse() throws Exception {
        Course input = new Course();
        input.setTitle("New Course");

        Course saved = new Course();
        saved.setId(1L);
        saved.setTitle("New Course");

        when(courseService.create(any(Course.class))).thenReturn(saved);

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("New Course"));
    }




    @Test
    void shouldDeleteCourse() throws Exception {
        mockMvc.perform(delete("/api/courses/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetCoursesByFormationId() throws Exception {
        Course c = new Course();
        c.setId(1L);
        c.setTitle("Filtered Course");

        when(courseService.getByFormation(1L)).thenReturn(List.of(c));

        mockMvc.perform(get("/api/courses?formationId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Filtered Course"));
    }
}