package com.example.pi.service;

import com.example.pi.client.UserClient;
import com.example.pi.dto.SubmitRequest;
import com.example.pi.dto.UserDTO;
import com.example.pi.entity.*;
import com.example.pi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestAttemptServiceTest {

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private RewardService rewardService;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private TestAttemptService testAttemptService;

    private com.example.pi.entity.Test testEntity;   // ← nom complet pour éviter conflit
    private Question question;
    private Answer correctAnswer;
    private Answer wrongAnswer;

    @BeforeEach
    void setUp() {
        Formation formation = new Formation();
        formation.setId(1L);

        testEntity = new com.example.pi.entity.Test();
        testEntity.setId(1L);
        testEntity.setPassingScore(60);
        testEntity.setFormation(formation);

        question = new Question();
        question.setId(10L);
        question.setPoints(10);
        question.setTest(testEntity);

        correctAnswer = new Answer();
        correctAnswer.setId(100L);
        correctAnswer.setCorrect(true);
        correctAnswer.setQuestion(question);

        wrongAnswer = new Answer();
        wrongAnswer.setId(101L);
        wrongAnswer.setCorrect(false);
        wrongAnswer.setQuestion(question);

        question.setAnswers(List.of(correctAnswer, wrongAnswer));
        testEntity.setQuestions(List.of(question));
    }

    @Test
    void submit_shouldComputeScoreAndCallFeignAndSaveAttempt() {
        SubmitRequest request = new SubmitRequest();
        request.setUserId(5L);
        request.setAnswers(Map.of(10L, 100L));

        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));
        when(answerRepository.findById(100L)).thenReturn(Optional.of(correctAnswer));
        when(testAttemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO mockUser = new UserDTO();
        mockUser.setUsername("john_doe");
        when(userClient.getUserById(5L)).thenReturn(mockUser);

        TestAttempt result = testAttemptService.submit(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(10);
        assertThat(result.getTotalPoints()).isEqualTo(10);
        assertThat(result.isPassed()).isTrue();
        assertThat(result.getUserId()).isEqualTo(5L);
        assertThat(result.getUserName()).isEqualTo("john_doe");

        verify(rewardService).assignReward(1L, 100);
        verify(testAttemptRepository).save(any(TestAttempt.class));
    }

    @Test
    void submit_whenWrongAnswer_shouldFailAndNotCallReward() {
        SubmitRequest request = new SubmitRequest();
        request.setUserId(5L);
        request.setAnswers(Map.of(10L, 101L));

        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));
        when(answerRepository.findById(101L)).thenReturn(Optional.of(wrongAnswer));
        when(testAttemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO mockUser = new UserDTO();
        mockUser.setUsername("john_doe");
        when(userClient.getUserById(5L)).thenReturn(mockUser);

        TestAttempt result = testAttemptService.submit(1L, request);

        assertThat(result.getScore()).isZero();
        assertThat(result.isPassed()).isFalse();
        verify(rewardService, never()).assignReward(anyLong(), anyInt());
    }

    @Test
    void submit_whenUserClientFails_shouldFallbackToDefaultUsername() {
        SubmitRequest request = new SubmitRequest();
        request.setUserId(5L);
        request.setAnswers(Map.of(10L, 100L));

        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));
        when(answerRepository.findById(100L)).thenReturn(Optional.of(correctAnswer));
        when(testAttemptRepository.save(any(TestAttempt.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userClient.getUserById(5L)).thenThrow(new RuntimeException("Network error"));

        TestAttempt result = testAttemptService.submit(1L, request);

        assertThat(result.getUserName()).isEqualTo("Utilisateur");
        assertThat(result.isPassed()).isTrue();
    }

    @Test
    void submit_whenTestNotFound_shouldThrowException() {
        when(testRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> testAttemptService.submit(99L, new SubmitRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Test not found");
    }
}