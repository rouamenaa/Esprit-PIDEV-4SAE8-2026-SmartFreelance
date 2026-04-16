package com.example.pi.service;

import com.example.pi.entity.Question;
import com.example.pi.entity.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CSVQuestionServiceTest {

    @InjectMocks
    private CSVQuestionService csvQuestionService;

    @org.junit.jupiter.api.Test
    void shouldReturnQuestionsFromCSV() {

        Test test = new Test();
        test.setId(1L);

        String category = "IT & Software";

        List<Question> result = csvQuestionService.generateQuestionsFromCSV(
                test,
                5,
                category
        );

        assertNotNull(result);
        assertTrue(result.size() <= 5);
    }

    @org.junit.jupiter.api.Test
    void shouldHandleUnknownCategory() {

        Test test = new Test();

        List<Question> result = csvQuestionService.generateQuestionsFromCSV(
                test,
                3,
                "UNKNOWN"
        );

        assertNotNull(result);
    }
}