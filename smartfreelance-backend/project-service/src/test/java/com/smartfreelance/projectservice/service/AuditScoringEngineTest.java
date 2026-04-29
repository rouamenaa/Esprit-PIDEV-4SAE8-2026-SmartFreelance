package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditScore;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.entity.Project;
import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.entity.Task;
import com.smartfreelance.projectservice.enums.AuditTrend;
import com.smartfreelance.projectservice.enums.AuditVerdict;
import com.smartfreelance.projectservice.enums.TaskStatus;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditRepository;
import com.smartfreelance.projectservice.repository.AuditScoreRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import com.smartfreelance.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuditScoringEngineTest {

    private AuditScoreRepository scoreRepository;
    private AuditRepository auditRepository;
    private AuditReportRepository reportRepository;
    private AuditTicketRepository ticketRepository;
    private ProjectRepository projectRepository;
    private AuditScoringEngine engine;

    @BeforeEach
    void setUp() {
        scoreRepository = mock(AuditScoreRepository.class);
        auditRepository = mock(AuditRepository.class);
        reportRepository = mock(AuditReportRepository.class);
        ticketRepository = mock(AuditTicketRepository.class);
        projectRepository = mock(ProjectRepository.class);
        engine = new AuditScoringEngine(
                scoreRepository,
                auditRepository,
                reportRepository,
                ticketRepository,
                projectRepository
        );
    }

    @Test
    void shouldComputeAndPersistScoreWithCertifiedVerdict() {
        Audit audit = audit(1, 100);
        AuditReport report = report(90f, 88.0);
        Project project = projectWithStructure();
        List<AuditTicket> tickets = List.of(ticket(TicketStatus.RESOLVED), ticket(TicketStatus.RESOLVED));

        when(auditRepository.findById(1)).thenReturn(Optional.of(audit));
        when(reportRepository.findByAuditId(1)).thenReturn(List.of(report));
        when(ticketRepository.findByAuditId(1)).thenReturn(tickets);
        when(projectRepository.findById(100L)).thenReturn(Optional.of(project));
        when(scoreRepository.findPlatformAverage()).thenReturn(null);
        when(scoreRepository.findProjectAverage(100)).thenReturn(null);
        when(scoreRepository.findTop3ByProjectIdOrderByCalculatedAtDesc(100)).thenReturn(Collections.emptyList());
        when(scoreRepository.findByProjectIdOrderByCalculatedAtAsc(100)).thenReturn(Collections.emptyList());
        when(scoreRepository.findTopByAuditIdOrderByCalculatedAtDescIdDesc(1)).thenReturn(null);
        when(scoreRepository.save(any(AuditScore.class))).thenAnswer(i -> i.getArgument(0));

        AuditScore score = engine.computeScore(1);

        assertNotNull(score.getCompositeScore());
        assertTrue(score.getCompositeScore() >= 80);
        assertEquals(AuditVerdict.CERTIFIED, score.getVerdict());
        assertEquals(AuditTrend.INSUFFICIENT_DATA, score.getTrend());
    }

    @Test
    void shouldRetrySaveWithShorterStatementWhenColumnTooShort() {
        Audit audit = audit(2, 200);
        AuditReport report = report(70f, 60.0);

        when(auditRepository.findById(2)).thenReturn(Optional.of(audit));
        when(reportRepository.findByAuditId(2)).thenReturn(List.of(report));
        when(ticketRepository.findByAuditId(2)).thenReturn(List.of(ticket(TicketStatus.OPEN)));
        when(projectRepository.findById(200L)).thenReturn(Optional.of(projectWithStructure()));
        when(scoreRepository.findPlatformAverage()).thenReturn(55.0);
        when(scoreRepository.findProjectAverage(200)).thenReturn(58.0);
        when(scoreRepository.findTop3ByProjectIdOrderByCalculatedAtDesc(200))
                .thenReturn(List.of(existingScore(50.0)));
        when(scoreRepository.findByProjectIdOrderByCalculatedAtAsc(200))
                .thenReturn(List.of(existingScore(45.0), existingScore(52.0)));
        when(scoreRepository.findTopByAuditIdOrderByCalculatedAtDescIdDesc(2)).thenReturn(null);
        when(scoreRepository.save(any(AuditScore.class)))
                .thenThrow(new DataIntegrityViolationException("too long"))
                .thenAnswer(i -> i.getArgument(0));

        AuditScore score = engine.computeScore(2);

        verify(scoreRepository, times(2)).save(any(AuditScore.class));
        assertNotNull(score.getVerdictStatement());
        assertTrue(score.getVerdictStatement().length() <= 60);
    }

    @Test
    void shouldThrowWhenAuditNotFound() {
        when(auditRepository.findById(404)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> engine.computeScore(404));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldThrowWhenScoreNotYetComputed() {
        when(scoreRepository.findTopByAuditIdOrderByCalculatedAtDescIdDesc(5)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> engine.getScoreByAudit(5));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Score not computed yet"));
    }

    @Test
    void shouldReturnProjectHistory() {
        List<AuditScore> history = List.of(existingScore(40.0), existingScore(70.0));
        when(scoreRepository.findByProjectIdOrderByCalculatedAtAsc(123)).thenReturn(history);

        List<AuditScore> result = engine.getProjectHistory(123);

        assertEquals(2, result.size());
    }

    private Audit audit(int id, int projectId) {
        Audit audit = new Audit();
        audit.setId(id);
        audit.setProjectId(projectId);
        return audit;
    }

    private AuditReport report(Float score, Double progress) {
        AuditReport report = new AuditReport();
        report.setScore(score);
        report.setProgressScore(progress);
        return report;
    }

    private AuditTicket ticket(TicketStatus status) {
        AuditTicket ticket = new AuditTicket();
        ticket.setStatus(status);
        return ticket;
    }

    private AuditScore existingScore(double composite) {
        AuditScore score = new AuditScore();
        score.setCompositeScore(composite);
        score.setResolutionScore(composite);
        return score;
    }

    private Project projectWithStructure() {
        Task t1 = new Task();
        t1.setStatus(TaskStatus.DONE);
        t1.setDescription("done");
        Task t2 = new Task();
        t2.setStatus(TaskStatus.TODO);
        t2.setDescription("todo");

        ProjectPhase phase = new ProjectPhase();
        phase.setTasks(List.of(t1, t2));

        Project project = new Project();
        project.setStartDate(LocalDate.now().minusDays(2));
        project.setDeadline(LocalDate.now().plusDays(8));
        project.setPhases(List.of(phase));
        return project;
    }
}
