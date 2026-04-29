package com.example.pi.integration;

import com.example.pi.entity.Formation;
import com.example.pi.repository.FormationRepository;
import com.example.pi.service.FormationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class FormationServiceIntegrationTest {

    @Autowired
    private FormationService formationService;

    @MockBean
    private FormationRepository repo;

    // ---------------- GET ALL ----------------
    @Test
    void getAll_shouldReturnList() {

        when(repo.findAll())
                .thenReturn(List.of(new Formation()));

        List<Formation> result = formationService.getAll();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ---------------- GET BY ID ----------------
    @Test
    void getById_shouldReturnFormation() {

        Formation f = new Formation();
        f.setId(1L);

        when(repo.findById(1L))
                .thenReturn(Optional.of(f));

        Formation result = formationService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    // ---------------- CREATE ----------------
    @Test
    void create_shouldSaveFormation() {

        Formation f = new Formation();
        f.setTitle("Java");
        f.setCourses(null);
        f.setRewards(null);
        f.setTests(null);

        when(repo.save(any(Formation.class)))
                .thenReturn(f);

        Formation result = formationService.create(f);

        assertNotNull(result);
        assertEquals("Java", result.getTitle());

        verify(repo, times(1)).save(any(Formation.class));
    }

    // ---------------- UPDATE ----------------
    @Test
    void update_shouldModifyFormation() {

        Formation existing = new Formation();
        existing.setId(1L);
        existing.setTitle("Old");

        Formation update = new Formation();
        update.setTitle("New");
        update.setDescription("Desc");
        update.setDuration(10);
        update.setLevel("Beginner");

        when(repo.findById(1L))
                .thenReturn(Optional.of(existing));

        when(repo.save(any(Formation.class)))
                .thenReturn(existing);

        Formation result = formationService.update(1L, update);

        assertEquals("New", result.getTitle());
        assertEquals("Desc", result.getDescription());
        assertEquals(10, result.getDuration());
        assertEquals("Beginner", result.getLevel());
    }

    // ---------------- DELETE ----------------
    @Test
    void delete_shouldCallRepository() {

        when(repo.existsById(1L)).thenReturn(true);
        doNothing().when(repo).deleteById(1L);

        formationService.delete(1L);

        verify(repo, times(1)).deleteById(1L);
    }

    // ---------------- PAGINATION ----------------
    @Test
    void getAllPaginated_shouldReturnPage() {

        Formation f = new Formation();

        Page<Formation> page = new PageImpl<>(List.of(f));

        when(repo.findAll(any(Pageable.class)))
                .thenReturn(page);

        Page<Formation> result = formationService.getAllPaginated(
                0, 10, "id", "asc"
        );

        assertEquals(1, result.getContent().size());
    }

    // ---------------- SEARCH (Specification) ----------------
    @Test
    void search_shouldReturnFilteredResults() {

        Formation f = new Formation();

        Page<Formation> page = new PageImpl<>(List.of(f));

        when(repo.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        Page<Formation> result = formationService.searchFormations(
                "Java",
                1,
                10,
                "Beginner",
                0,
                10,
                "id",
                "asc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    // ---------------- SEARCH EMPTY (no spec) ----------------
    @Test
    void search_withoutFilters_shouldReturnAll() {

        Formation f = new Formation();

        Page<Formation> page = new PageImpl<>(List.of(f));

        when(repo.findAll(any(Pageable.class)))
                .thenReturn(page);

        Page<Formation> result = formationService.searchFormations(
                null, null, null, null,
                0, 10, "id", "asc"
        );

        assertEquals(1, result.getContent().size());
    }
}