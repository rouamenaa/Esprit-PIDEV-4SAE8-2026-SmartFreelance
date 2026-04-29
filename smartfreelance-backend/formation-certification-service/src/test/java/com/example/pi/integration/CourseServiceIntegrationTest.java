package com.example.pi.integration;

import com.example.pi.entity.Course;
import com.example.pi.entity.Formation;
import com.example.pi.repository.CourseRepository;
import com.example.pi.repository.FormationRepository;
import com.example.pi.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class CourseServiceIntegrationTest {

    @Autowired
    private CourseService courseService;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private FormationRepository formationRepository;

    // ---------------- GET ALL ----------------
    @Test
    void getAll_shouldReturnList() {

        when(courseRepository.findAll())
                .thenReturn(List.of(new Course()));

        List<Course> result = courseService.getAll();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ---------------- GET BY ID ----------------
    @Test
    void getById_shouldReturnCourse() {

        Course c = new Course();
        c.setId(1L);

        when(courseRepository.findById(1L))
                .thenReturn(Optional.of(c));

        Course result = courseService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    // ---------------- CREATE ----------------
    @Test
    void create_shouldSaveCourse() {

        Formation f = new Formation();
        f.setId(1L);

        Course c = new Course();
        c.setTitle("Java");
        c.setFormation(f);

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(courseRepository.save(any(Course.class)))
                .thenReturn(c);

        Course result = courseService.create(c);

        assertNotNull(result);
        assertEquals("Java", result.getTitle());
    }

    // ---------------- UPDATE ----------------
    @Test
    void update_shouldModifyCourse() {

        Formation f = new Formation();
        f.setId(1L);

        Course existing = new Course();
        existing.setId(1L);
        existing.setTitle("Old");

        Course update = new Course();
        update.setTitle("New");
        update.setContent("Content");
        update.setVideoUrl("url");
        update.setFormation(f);

        when(courseRepository.findById(1L))
                .thenReturn(Optional.of(existing));

        when(formationRepository.findById(1L))
                .thenReturn(Optional.of(f));

        when(courseRepository.save(any(Course.class)))
                .thenReturn(existing);

        Course result = courseService.update(1L, update);

        assertEquals("New", result.getTitle());
        assertEquals("Content", result.getContent());
        assertEquals("url", result.getVideoUrl());
    }

    // ---------------- DELETE ----------------
    @Test
    void delete_shouldCallRepository() {

        doNothing().when(courseRepository).deleteById(1L);

        courseService.delete(1L);

        verify(courseRepository, times(1)).deleteById(1L);
    }

    // ---------------- GET BY FORMATION ----------------
    @Test
    void getByFormation_shouldReturnList() {

        when(courseRepository.findByFormationId(1L))
                .thenReturn(List.of(new Course()));

        List<Course> result = courseService.getByFormation(1L);

        assertEquals(1, result.size());
    }
}