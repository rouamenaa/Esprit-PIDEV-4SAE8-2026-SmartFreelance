package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.*;
import com.smartfreelance.projectservice.enums.PhaseStatus;
import com.smartfreelance.projectservice.enums.TaskPriority; // ✅ FIX
import com.smartfreelance.projectservice.enums.TaskStatus;
import com.smartfreelance.projectservice.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
//azert
@Service
public class ActionPlanService {
    private final AuditAnalysisRepository analysisRepository;
    private final AuditReportRepository reportRepository;
    private final AuditRepository auditRepository;
    private final ProjectRepository projectRepository;
    private final ProjectPhaseRepository phaseRepository;
    private final TaskRepository taskRepository;

    public ActionPlanService(AuditAnalysisRepository analysisRepository,
            AuditReportRepository reportRepository,
            AuditRepository auditRepository,
            ProjectRepository projectRepository,
            ProjectPhaseRepository phaseRepository,
            TaskRepository taskRepository) {
        this.analysisRepository = analysisRepository;
        this.reportRepository = reportRepository;
        this.auditRepository = auditRepository;
        this.projectRepository = projectRepository;
        this.phaseRepository = phaseRepository;
        this.taskRepository = taskRepository;
    }

    public List<Task> generateActionPlan(Integer analysisId) {

        AuditAnalysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Analysis not found"));

        AuditReport report = reportRepository.findById(analysis.getAuditReportId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        Audit audit = auditRepository.findById(report.getAuditId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Audit not found"));

        if (audit.getProjectId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Audit has no projectId");
        }

        Long projectId = audit.getProjectId().longValue();

        List<String> steps = extractSteps(analysis.getCorrectionPlan(), analysis.getRecommendations());

        if (steps.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No correction steps found in AI analysis");
        }

        ProjectPhase actionPhase = createActionPhase(projectId, analysis);

        List<Task> tasks = new ArrayList<>();
        for (int i = 0; i < steps.size(); i++) {
            Task task = createTask(actionPhase, steps.get(i), i,
                    analysis.getRiskProbability());
            tasks.add(task);
        }

        return tasks;
    }

    public List<Task> getActionPlanByAnalysis(Integer analysisId) {

        AuditAnalysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Analysis not found"));

        String phaseName = "🛠 AI Action Plan #" + analysisId;

        List<ProjectPhase> phases = phaseRepository.findByNameContaining(phaseName);

        if (phases.isEmpty())
            return List.of();

        return taskRepository.findByPhaseId(phases.get(0).getId());
    }

    // ================= HELPERS =================

    private List<String> extractSteps(String correctionPlan, String recommendations) {
        List<String> steps = splitAndClean(correctionPlan, true);
        if (!steps.isEmpty()) {
            return steps;
        }

        List<String> fallback = splitAndClean(recommendations, true);
        List<String> generated = new ArrayList<>();

        for (String rec : fallback) {
            generated.add("Execute: " + rec);
            if (generated.size() == 5) {
                break;
            }
        }

        if (generated.isEmpty()) {
            generated.add("Prioritize critical tickets and assign owners");
            generated.add("Fix highest-impact blockers and validate with tests");
            generated.add("Stabilize sprint scope and monitor daily progress");
            generated.add("Review risks weekly and adjust mitigation plan");
        }

        return generated;
    }

    private List<String> splitAndClean(String value, boolean strict) {
        if (value == null || value.isBlank())
            return List.of();

        String normalized = value
                .replace("\r", "|")
                .replace("\n", "|")
                .replace(";", "|");

        List<String> items = new ArrayList<>();
        for (String token : normalized.split("\\|")) {
            String cleaned = token
                    .replaceAll("^[-*•]+\\s*", "")
                    .replaceAll("(?i)^step\\s*\\d+\\s*[:.)-]?\\s*", "")
                    .replaceAll("^\\d+\\s*[:.)-]\\s*", "")
                    .trim();

            if (cleaned.isEmpty()) {
                continue;
            }

            if (strict && isPlaceholder(cleaned)) {
                continue;
            }

            items.add(cleaned);
            if (items.size() == 5) {
                break;
            }
        }
        return items;
    }

    private boolean isPlaceholder(String text) {
        String value = text.toLowerCase().trim();
        if (value.matches("step\\s*\\d+"))
            return true;
        if (value.matches("task\\s*\\d+"))
            return true;
        if (value.matches("action\\s*\\d+"))
            return true;
        if (value.matches("plan\\s*\\d+"))
            return true;
        if (value.matches("rec\\s*\\d+"))
            return true;
        return value.length() <= 6;
    }

    private ProjectPhase createActionPhase(Long projectId, AuditAnalysis analysis) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Project not found"));

        ProjectPhase phase = new ProjectPhase();
        phase.setName("🛠 AI Action Plan #" + analysis.getId());
        phase.setDescription("Auto-generated action plan from AI audit. Risk: "
                + String.format("%.0f", analysis.getRiskProbability()) + "%");
        phase.setStatus(PhaseStatus.IN_PROGRESS);
        phase.setProject(project);

        return phaseRepository.save(phase);
    }

    private Task createTask(ProjectPhase phase, String stepText,
            int index, Double riskProbability) {

        Task task = new Task();
        task.setTitle("Step " + (index + 1) + ": " + truncate(stepText, 80));
        task.setDescription(stepText);
        task.setStatus(TaskStatus.TODO);
        task.setPriority(resolvePriority(riskProbability, index)); // ✅ FIX OK
        task.setPhase(phase);

        task.setDueDate(LocalDate.now().plusDays(3L * (index + 1)));

        return taskRepository.save(task);
    }

    // ✅ FIX ICI
    private TaskPriority resolvePriority(Double risk, int index) {

        if (risk >= 70) {
            return index == 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM;
        }

        if (risk >= 40) {
            return TaskPriority.MEDIUM;
        }

        return TaskPriority.LOW;
    }

    private String truncate(String text, int max) {
        return text.length() > max ? text.substring(0, max) + "..." : text;
    }
}
