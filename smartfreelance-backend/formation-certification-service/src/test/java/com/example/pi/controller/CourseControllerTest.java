package com.example.pi.controller;

import com.example.pi.entity.Course;
import com.example.pi.service.CourseService;
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

@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService service;

    @Autowired
    private ObjectMapper objectMapper;

    // ─────────────────────────────
    // GET ALL
    // ─────────────────────────────
    @Test
    void shouldGetAllCourses() throws Exception {

        Course c = new Course();
        c.setId(1L);

        when(service.getAll()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─────────────────────────────
    // GET BY FORMATION
    // ─────────────────────────────
    @Test
    void shouldGetCoursesByFormation() throws Exception {

        Course c = new Course();
        c.setId(1L);

        when(service.getByFormation(1L)).thenReturn(List.of(c));

        mockMvc.perform(get("/api/courses?formationId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─────────────────────────────
    // GET BY ID
    // ─────────────────────────────
    @Test
    void shouldGetCourseById() throws Exception {

        Course c = new Course();
        c.setId(1L);

        when(service.getById(1L)).thenReturn(c);

        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // CREATE
    // ─────────────────────────────
    @Test
    void shouldCreateCourse() throws Exception {

        Course input = new Course();
        input.setId(1L);

        Course saved = new Course();
        saved.setId(1L);

        when(service.create(any(Course.class))).thenReturn(saved);

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // UPDATE
    // ─────────────────────────────
    @Test
    void shouldUpdateCourse() throws Exception {

        Course input = new Course();
        input.setId(1L);

        Course updated = new Course();
        updated.setId(1L);

        when(service.update(eq(1L), any(Course.class))).thenReturn(updated);

        mockMvc.perform(put("/api/courses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ─────────────────────────────
    // DELETE
    // ─────────────────────────────
    @Test
    void shouldDeleteCourse() throws Exception {

        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/courses/1"))
                .andExpect(status().isOk());
    }
}