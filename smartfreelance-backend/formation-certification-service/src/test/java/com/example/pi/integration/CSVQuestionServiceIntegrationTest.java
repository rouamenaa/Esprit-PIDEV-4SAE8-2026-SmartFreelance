package com.example.pi.integration;

import com.example.pi.service.CSVQuestionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CSVQuestionServiceIntegrationTest {

    @Autowired
    private CSVQuestionService csvQuestionService;

    @Test
    void generateQuestionsFromCSV_shouldReturnQuestions() {

        com.example.pi.entity.Test test =
                new com.example.pi.entity.Test();

        List<com.example.pi.entity.Question> questions =
                csvQuestionService.generateQuestionsFromCSV(
                        test,
                        3,
                        "IT & Software"
                );

        assertNotNull(questions);
        assertFalse(questions.isEmpty());
        assertTrue(questions.size() <= 3);

        com.example.pi.entity.Question q = questions.get(0);
        assertNotNull(q.getContent());
        assertEquals(4, q.getAnswers().size());
    }
}