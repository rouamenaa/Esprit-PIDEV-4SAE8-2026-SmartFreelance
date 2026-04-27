package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditAnalysis;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.entity.Task;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.AuditType;
import com.smartfreelance.projectservice.enums.TaskPriority;
import com.smartfreelance.projectservice.repository.AuditAnalysisRepository;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditRepository;
import com.smartfreelance.projectservice.repository.ProjectPhaseRepository;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import com.smartfreelance.projectservice.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ActionPlanServiceTest {

    private AuditAnalysisRepository analysisRepository;
    private AuditReportRepository reportRepository;
    private AuditRepository auditRepository;
    private ProjectRepository projectRepository;
    private ProjectPhaseRepository phaseRepository;
    private TaskRepository taskRepository;
    private ActionPlanService service;

    @BeforeEach
    void setUp() {
        analysisRepository = mock(AuditAnalysisRepository.class);
        reportRepository = mock(AuditReportRepository.class);
        auditRepository = mock(AuditRepository.class);
        projectRepository = mock(ProjectRepository.class);
        phaseRepository = mock(ProjectPhaseRepository.class);
        taskRepository = mock(TaskRepository.class);
        service = new ActionPlanService(
                analysisRepository,
                reportRepository,
                auditRepository,
                projectRepository,
                phaseRepository,
                taskRepository);
    }

    @Test
    void shouldGenerateActionPlanFromCorrectionPlan() {
        setupChain(1, "Step 1: Fix auth;Step 2: Add tests", "Fallback rec", 80.0);
        when(phaseRepository.save(any(ProjectPhase.class))).thenAnswer(i -> i.getArgument(0));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        List<Task> tasks = service.generateActionPlan(1);

        assertEquals(2, tasks.size());
        assertEquals(TaskPriority.HIGH, tasks.get(0).getPriority());
        assertEquals(TaskPriority.MEDIUM, tasks.get(1).getPriority());
        assertTrue(tasks.get(0).getTitle().contains("Step 1"));
    }

    @Test
    void shouldFallbackToRecommendationsWhenCorrectionPlanHasOnlyPlaceholders() {
        setupChain(2, "Step 1|Task 2|Plan 3", "Refactor module;Write integration tests", 50.0);
        when(phaseRepository.save(any(ProjectPhase.class))).thenAnswer(i -> i.getArgument(0));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        List<Task> tasks = service.generateActionPlan(2);

        assertEquals(2, tasks.size());
        assertTrue(tasks.get(0).getDescription().startsWith("Execute:"));
        assertEquals(TaskPriority.MEDIUM, tasks.get(0).getPriority());
    }

    @Test
    void shouldGenerateDefaultPlanWhenNoCorrectionStepsFound() {
        setupChain(3, null, null, 20.0);
        when(phaseRepository.save(any(ProjectPhase.class))).thenAnswer(i -> i.getArgument(0));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        List<Task> tasks = service.generateActionPlan(3);

        assertEquals(4, tasks.size());
        assertEquals(TaskPriority.LOW, tasks.get(0).getPriority());
    }

    @Test
    void shouldReturnEmptyActionPlanWhenNoPhaseExists() {
        AuditAnalysis analysis = new AuditAnalysis();
        analysis.setId(99);
        when(analysisRepository.findById(99)).thenReturn(Optional.of(analysis));
        when(phaseRepository.findByNameContaining("🛠 AI Action Plan #99")).thenReturn(Collections.emptyList());

        List<Task> tasks = service.getActionPlanByAnalysis(99);

        assertTrue(tasks.isEmpty());
    }

    @Test
    void shouldReturnTasksWhenActionPhaseExists() {
        AuditAnalysis analysis = new AuditAnalysis();
        analysis.setId(88);
        ProjectPhase phase = new ProjectPhase();
        phase.setId(77L);
        Task task = new Task();
        task.setId(10L);

        when(analysisRepository.findById(88)).thenReturn(Optional.of(analysis));
        when(phaseRepository.findByNameContaining("🛠 AI Action Plan #88")).thenReturn(List.of(phase));
        when(taskRepository.findByPhaseId(77L)).thenReturn(List.of(task));

        List<Task> tasks = service.getActionPlanByAnalysis(88);

        assertEquals(1, tasks.size());
        assertEquals(10L, tasks.get(0).getId());
    }

    private void setupChain(int analysisId, String correctionPlan, String recommendations, double risk) {
        AuditAnalysis analysis = new AuditAnalysis();
        analysis.setId(analysisId);
        analysis.setAuditReportId(11);
        analysis.setCorrectionPlan(correctionPlan);
        analysis.setRecommendations(recommendations);
        analysis.setRiskProbability(risk);

        AuditReport report = new AuditReport();
        report.setId(11);
        report.setAuditId(12);

        Audit audit = new Audit();
        audit.setId(12);
        audit.setProjectId(13);
        audit.setAuditType(AuditType.QUALITY);
        audit.setStatus(AuditStatus.REPORTED);

        Project project = new Project();
        project.setId(13L);

        when(analysisRepository.findById(analysisId)).thenReturn(Optional.of(analysis));
        when(reportRepository.findById(11)).thenReturn(Optional.of(report));
        when(auditRepository.findById(12)).thenReturn(Optional.of(audit));
        when(projectRepository.findById(13L)).thenReturn(Optional.of(project));
    }
}
