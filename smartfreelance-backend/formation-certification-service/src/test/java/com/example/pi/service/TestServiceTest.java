package com.example.pi.service;

import com.example.pi.entity.Formation;
import com.example.pi.entity.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TestService Unit Tests")
class TestServiceTest {

    @Mock
    private com.example.pi.repository.TestRepository testRepo;

    @Mock
    private com.example.pi.repository.FormationRepository formationRepo;

    @Mock
    private CSVQuestionService csvQuestionService;

    @InjectMocks
    private TestService testService;

    private Formation formation;
    private com.example.pi.entity.Test testEntity;

    @BeforeEach
    void setUp() {
        formation = new Formation();
        formation.setId(1L);
        formation.setCategory("IT & Software");

        testEntity = new com.example.pi.entity.Test();
        testEntity.setId(1L);
        testEntity.setTitle("Java Test");
        testEntity.setPassingScore(70);
        testEntity.setFormation(formation);
    }

    // ================= GET ALL =================
    @Test
    @DisplayName("Should return all tests")
    void shouldGetAllTests() {
        when(testRepo.findAll()).thenReturn(List.of(testEntity));

        List<com.example.pi.entity.Test> result = testService.getAll();

        assertEquals(1, result.size());
        verify(testRepo).findAll();
    }

    // ================= GET BY ID =================
    @Test
    @DisplayName("Should return test by id")
    void shouldGetTestById() {
        when(testRepo.findById(1L)).thenReturn(Optional.of(testEntity));

        com.example.pi.entity.Test result = testService.getById(1L);

        assertNotNull(result);
        assertEquals("Java Test", result.getTitle());
    }

    // ================= CREATE =================
    @Test
    @DisplayName("Should create test")
    void shouldCreateTest() {
        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(testRepo.save(any())).thenReturn(testEntity);

        com.example.pi.entity.Test result = testService.create(testEntity);

        assertNotNull(result);
        verify(testRepo).save(any());
    }

    // ================= UPDATE =================
    @Test
    @DisplayName("Should update test")
    void shouldUpdateTest() {
        com.example.pi.entity.Test updated = new com.example.pi.entity.Test();
        updated.setTitle("Updated");
        updated.setPassingScore(90);

        when(testRepo.findById(1L)).thenReturn(Optional.of(testEntity));
        when(testRepo.save(any())).thenReturn(testEntity);

        com.example.pi.entity.Test result = testService.update(1L, updated);

        assertNotNull(result);
        verify(testRepo).save(any());
    }

    // ================= DELETE =================
    @Test
    @DisplayName("Should delete test")
    void shouldDeleteTest() {
        when(testRepo.existsById(1L)).thenReturn(true);

        testService.delete(1L);

        verify(testRepo).deleteById(1L);
    }

    // ================= CREATE WITH QUESTIONS =================
    @Test
    @DisplayName("Should create test with questions")
    void shouldCreateTestWithQuestions() {

        when(formationRepo.findById(1L)).thenReturn(Optional.of(formation));
        when(testRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Question q = new Question();
        q.setContent("Question 1");

        when(csvQuestionService.generateQuestionsFromCSV(
                any(),
                eq(5),
                anyString()
        )).thenReturn(List.of(q));

        com.example.pi.entity.Test result = testService.createWithQuestions(testEntity, 5);

        assertNotNull(result);
        assertEquals(1, result.getQuestions().size());

        verify(csvQuestionService).generateQuestionsFromCSV(any(), eq(5), anyString());
    }
}