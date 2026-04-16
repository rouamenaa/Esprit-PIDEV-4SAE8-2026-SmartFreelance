package com.example.pi.service;

import com.example.pi.entity.Course;
import com.example.pi.entity.Formation;
import com.example.pi.repository.CourseRepository;
import com.example.pi.repository.FormationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository repo;

    @Mock
    private FormationRepository formationRepo;

    @InjectMocks
    private CourseService courseService;

    // ─────────────────────────────
    // GET ALL
    // ─────────────────────────────
    @Test
    void shouldReturnAllCourses() {

        Course c = new Course();
        c.setId(1L);

        when(repo.findAll()).thenReturn(List.of(c));

        List<Course> result = courseService.getAll();

        assertEquals(1, result.size());
        verify(repo, times(1)).findAll();
    }

    // ─────────────────────────────
    // GET BY ID
    // ─────────────────────────────
    @Test
    void shouldReturnCourseById() {

        Course c = new Course();
        c.setId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(c));

        Course result = courseService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void shouldThrowIfCourseNotFound() {

        when(repo.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> courseService.getById(1L));

        assertTrue(ex.getMessage().contains("Course not found"));
    }

    // ─────────────────────────────
    // GET BY FORMATION
    // ─────────────────────────────
    @Test
    void shouldReturnCoursesByFormation() {

        Course c = new Course();
        c.setId(1L);

        when(repo.findByFormationId(1L)).thenReturn(List.of(c));

        List<Course> result = courseService.getByFormation(1L);

        assertEquals(1, result.size());
    }

    // ─────────────────────────────
    // CREATE
    // ─────────────────────────────
    @Test
    void shouldCreateCourse() {

        Formation f = new Formation();
        f.setId(1L);

        Course input = new Course();
        input.setTitle("Java");
        input.setFormation(f);

        when(formationRepo.findById(1L)).thenReturn(Optional.of(f));
        when(repo.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.create(input);

        assertEquals("Java", result.getTitle());
        verify(repo, times(1)).save(input);
    }

    @Test
    void shouldThrowIfFormationMissing() {

        Course c = new Course();

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> courseService.create(c));

        assertTrue(ex.getMessage().contains("Formation is required"));
    }

    @Test
    void shouldThrowIfFormationNotFound() {

        Formation f = new Formation();
        f.setId(1L);

        Course c = new Course();
        c.setFormation(f);

        when(formationRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> courseService.create(c));
    }

    // ─────────────────────────────
    // UPDATE
    // ─────────────────────────────
    @Test
    void shouldUpdateCourse() {

        Course existing = new Course();
        existing.setId(1L);
        existing.setTitle("Old");

        Formation f = new Formation();
        f.setId(1L);

        Course update = new Course();
        update.setTitle("New");
        update.setContent("Content");

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.update(1L, update);

        assertEquals("New", result.getTitle());
    }

    // ─────────────────────────────
    // DELETE
    // ─────────────────────────────
    @Test
    void shouldDeleteCourse() {

        doNothing().when(repo).deleteById(1L);

        courseService.delete(1L);

        verify(repo, times(1)).deleteById(1L);
    }
}