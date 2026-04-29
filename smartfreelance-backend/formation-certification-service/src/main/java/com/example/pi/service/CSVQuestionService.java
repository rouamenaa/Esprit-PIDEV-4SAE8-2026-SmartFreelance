package com.example.pi.service;

import com.example.pi.entity.Answer;
import com.example.pi.entity.Question;
import com.example.pi.entity.Test;
import com.opencsv.CSVReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class CSVQuestionService {

    // ✅ Mapping catégorie formation → catégorie CSV
    private static final Map<String, String> CATEGORY_MAP = Map.of(
            "IT & Software", "IT",
            "Management", "ProjectManagement",
            "Marketing", "Marketing",
            "Design", "Design",
            "Languages", "Languages",
            "Finance", "Finance",
            "Human Resources", "HR",
            "Personal Development", "PersonalDevelopment"
    );

    public List<Question> generateQuestionsFromCSV(Test test, int numberOfQuestions, String formationCategory) {
        List<Question> allQuestions = new ArrayList<>();

        // ✅ Mapper la catégorie de la formation vers la catégorie CSV
        String csvCategory = CATEGORY_MAP.getOrDefault(formationCategory, formationCategory);

        try {
            ClassPathResource resource = new ClassPathResource("data/questions.csv");
            CSVReader reader = new CSVReader(new InputStreamReader(resource.getInputStream()));

            String[] line;
            boolean firstLine = true;

            while ((line = reader.readNext()) != null) {
                if (firstLine) { firstLine = false; continue; }
                if (line.length < 8) continue;

                // ✅ Filtrer par catégorie
                String questionCategory = line[7].trim().replace("\"", "");
                if (!questionCategory.equalsIgnoreCase(csvCategory)) continue;

                Question question = new Question();
                question.setContent(line[0].trim().replace("\"", ""));
                question.setPoints(Integer.parseInt(line[6].trim().replace("\"", "")));
                question.setTest(test);

                int correctIndex = Integer.parseInt(line[5].trim().replace("\"", ""));

                List<Answer> answers = new ArrayList<>();
                for (int i = 1; i <= 4; i++) {
                    Answer answer = new Answer();
                    answer.setContent(line[i].trim().replace("\"", ""));
                    answer.setCorrect(i == correctIndex);
                    answer.setQuestion(question);
                    answers.add(answer);
                }

                question.setAnswers(answers);
                allQuestions.add(question);
            }

            reader.close();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lecture CSV : " + e.getMessage());
        }

        // ✅ Mélanger et prendre N questions aléatoirement
        Collections.shuffle(allQuestions);
        return allQuestions.subList(0, Math.min(numberOfQuestions, allQuestions.size()));
    }
}