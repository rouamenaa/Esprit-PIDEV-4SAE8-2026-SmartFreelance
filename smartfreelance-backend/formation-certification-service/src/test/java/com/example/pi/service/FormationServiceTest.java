package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.repository.FormationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormationServiceTest {

    @Mock
    private FormationRepository repo;

    @InjectMocks
    private FormationService service;

    private Formation formation;

    @BeforeEach
    void setUp() {
        formation = new Formation();
        formation.setId(1L);
        formation.setTitle("Java");
        formation.setDescription("Spring Boot");
        formation.setDuration(10);
    }

    // ---------------- GET ALL ----------------

    @Test
    void shouldReturnAllFormations() {
        when(repo.findAll()).thenReturn(List.of(formation));

        List<Formation> result = service.getAll();

        assertEquals(1, result.size());
        verify(repo).findAll();
    }

    // ---------------- GET BY ID ----------------

    @Test
    void shouldReturnFormationById() {
        when(repo.findById(1L)).thenReturn(Optional.of(formation));

        Formation result = service.getById(1L);

        assertEquals("Java", result.getTitle());
    }

    @Test
    void shouldThrowIfFormationNotFound() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.getById(1L));
    }

    // ---------------- CREATE ----------------

    @Test
    void shouldCreateFormation() {
        when(repo.save(any(Formation.class))).thenReturn(formation);

        Formation result = service.create(formation);

        assertNotNull(result);
        verify(repo).save(any(Formation.class));
    }

    // ---------------- UPDATE ----------------

    @Test
    void shouldUpdateFormation() {
        Formation updated = new Formation();
        updated.setTitle("Updated");

        when(repo.findById(1L)).thenReturn(Optional.of(formation));
        when(repo.save(any())).thenReturn(formation);

        Formation result = service.update(1L, updated);

        assertNotNull(result);
        verify(repo).save(any(Formation.class));
    }

    // ---------------- DELETE ----------------

    @Test
    void shouldDeleteFormation() {
        when(repo.existsById(1L)).thenReturn(true);

        service.delete(1L);

        verify(repo).deleteById(1L);
    }

    @Test
    void shouldThrowWhenDeletingNonExisting() {
        when(repo.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> service.delete(1L));
    }

    // ---------------- PAGINATION ----------------

    @Test
    void shouldReturnPaginatedFormations() {
        Page<Formation> page = new PageImpl<>(List.of(formation));

        when(repo.findAll(any(Pageable.class))).thenReturn(page);

        Page<Formation> result = service.getAllPaginated(0, 10, "id", "asc");

        assertEquals(1, result.getTotalElements());
    }
}