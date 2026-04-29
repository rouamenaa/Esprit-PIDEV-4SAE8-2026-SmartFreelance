package com.example.pi.service;

import com.example.pi.client.UserClient;
import com.example.pi.dto.SubmitRequest;
import com.example.pi.dto.UserDTO;
import com.example.pi.entity.*;
import com.example.pi.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TestAttemptService {

    private final TestAttemptRepository repo;
    private final TestRepository testRepo;
    private final AnswerRepository answerRepo;
    private final RewardService rewardService;
    private final UserClient userClient;

    public TestAttemptService(TestAttemptRepository repo,
                              TestRepository testRepo,
                              AnswerRepository answerRepo,
                              RewardService rewardService,
                              UserClient userClient) {
        this.repo = repo;
        this.testRepo = testRepo;
        this.answerRepo = answerRepo;
        this.rewardService = rewardService;
        this.userClient = userClient;
    }

    // ✅ Soumettre le test + correction automatique + calcul score + récupération nom utilisateur
    public TestAttempt submit(Long testId, SubmitRequest request) {
        Test test = testRepo.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + testId));

        Map<Long, Long> userAnswers = request.getAnswers();
        Long userId = request.getUserId();

        int score = 0;
        int totalPoints = 0;

        for (Question question : test.getQuestions()) {
            totalPoints += question.getPoints();

            Long selectedAnswerId = userAnswers.get(question.getId());
            if (selectedAnswerId != null) {
                Answer selected = answerRepo.findById(selectedAnswerId).orElse(null);
                if (selected != null && selected.isCorrect()) {
                    score += question.getPoints();
                }
            }
        }

        int percentage = totalPoints > 0 ? (score * 100) / totalPoints : 0;
        boolean passed = percentage >= test.getPassingScore();

        // Récupérer le nom de l'utilisateur via Feign
        String userName = "Utilisateur";
        if (userId != null) {
            try {
                UserDTO user = userClient.getUserById(userId);
                userName = user.getUsername();
            } catch (Exception e) {
                System.err.println("Erreur lors de l'appel à user-service : " + e.getMessage());
            }
        }

        // Sauvegarder la tentative avec les infos utilisateur
        TestAttempt attempt = new TestAttempt();
        attempt.setTest(test);
        attempt.setScore(score);
        attempt.setTotalPoints(totalPoints);
        attempt.setPassed(passed);
        attempt.setAttemptDate(LocalDateTime.now());
        attempt.setUserId(userId);
        attempt.setUserName(userName);
        TestAttempt saved = repo.save(attempt);

        if (passed) {
            rewardService.assignReward(test.getFormation().getId(), percentage);
        }

        return saved;
    }

    public List<TestAttempt> getAll() {
        return repo.findAll();
    }

    public List<TestAttempt> getByTest(Long testId) {
        return repo.findByTestId(testId);
    }

    public TestAttempt getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + id));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Attempt not found with id: " + id);
        }
        repo.deleteById(id);
    }
}