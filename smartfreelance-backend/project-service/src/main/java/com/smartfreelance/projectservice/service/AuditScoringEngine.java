package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.*;
import com.smartfreelance.projectservice.enums.AuditTrend;
import com.smartfreelance.projectservice.enums.AuditVerdict;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AuditScoringEngine {

    private final AuditScoreRepository    scoreRepository;
    private final AuditRepository         auditRepository;
    private final AuditReportRepository   reportRepository;
    private final AuditTicketRepository   ticketRepository;
    private final ProjectRepository       projectRepository;

    public AuditScoringEngine(AuditScoreRepository scoreRepository,
                              AuditRepository auditRepository,
                              AuditReportRepository reportRepository,
                              AuditTicketRepository ticketRepository,
                              ProjectRepository projectRepository) {
        this.scoreRepository  = scoreRepository;
        this.auditRepository  = auditRepository;
        this.reportRepository = reportRepository;
        this.ticketRepository = ticketRepository;
        this.projectRepository = projectRepository;
    }

    // ── POINT D'ENTRÉE PRINCIPAL ─────────────────────────────────────────────

    public AuditScore computeScore(Integer auditId) {

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Audit not found"));

        // Récupérer le rapport
        List<AuditReport> reports = reportRepository.findByAuditId(auditId);
        AuditReport report = reports.isEmpty() ? null : reports.get(reports.size() - 1);

        // Récupérer les tickets
        List<AuditTicket> tickets = ticketRepository.findByAuditId(auditId);

        // Récupérer le projet
        Long projectId = audit.getProjectId().longValue();
        Project project = projectRepository.findById(projectId).orElse(null);

        // ── CALCUL DES 4 COMPOSANTES ─────────────────────────────────────────

        double qualityScore    = computeQualityScore(report);
        double temporalScore   = computeTemporalScore(project);
        double structuralScore = computeStructuralScore(project);
        double resolutionScore = computeResolutionScore(tickets, audit.getProjectId());

        // ── SCORE COMPOSITE ──────────────────────────────────────────────────

        double composite = (qualityScore    * 0.30)
                + (temporalScore   * 0.25)
                + (structuralScore * 0.20)
                + (resolutionScore * 0.25);

        composite = Math.min(100, Math.max(0, composite));

        // ── COMPARAISONS ─────────────────────────────────────────────────────

        Double platformAvg = scoreRepository.findPlatformAverage();
        if (platformAvg == null) platformAvg = composite;

        Double projectAvg = scoreRepository.findProjectAverage(audit.getProjectId());
        if (projectAvg == null) projectAvg = composite;

        // Delta avec l'audit précédent
        List<AuditScore> history = scoreRepository
                .findTop3ByProjectIdOrderByCalculatedAtDesc(audit.getProjectId());
        double delta = history.isEmpty() ? 0.0
                : composite - history.get(0).getCompositeScore();

        // ── TREND ────────────────────────────────────────────────────────────

        AuditTrend trend = computeTrend(audit.getProjectId(), composite);

        // ── VERDICT ──────────────────────────────────────────────────────────

        AuditVerdict verdict = computeVerdict(composite);

        // ── NIVEAU DE CONFIANCE ──────────────────────────────────────────────

        double confidence = computeConfidence(report, tickets, project);

        // ── VERDICT STATEMENT ────────────────────────────────────────────────

        String statement = buildVerdictStatement(verdict, composite, trend,
                audit, report);

        // ── SAUVEGARDER ──────────────────────────────────────────────────────

        AuditScore score = scoreRepository.findByAuditId(auditId)
                .orElse(new AuditScore());

        score.setAuditId(auditId);
        score.setProjectId(audit.getProjectId());
        score.setQualityScore(round(qualityScore));
        score.setTemporalScore(round(temporalScore));
        score.setStructuralScore(round(structuralScore));
        score.setResolutionScore(round(resolutionScore));
        score.setCompositeScore(round(composite));
        score.setPlatformAverage(round(platformAvg));
        score.setProjectAverage(round(projectAvg));
        score.setDeltaFromPrevious(round(delta));
        score.setVerdict(verdict);
        score.setTrend(trend);
        score.setConfidenceLevel(round(confidence));
        score.setVerdictStatement(statement);
        score.setCalculatedAt(LocalDateTime.now());

        return scoreRepository.save(score);
    }

    public AuditScore getScoreByAudit(Integer auditId) {
        return scoreRepository.findByAuditId(auditId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Score not computed yet for this audit"));
    }

    public List<AuditScore> getProjectHistory(Integer projectId) {
        return scoreRepository.findByProjectIdOrderByCalculatedAtAsc(projectId);
    }

    // ── COMPOSANTE 1 : QUALITÉ ───────────────────────────────────────────────

    private double computeQualityScore(AuditReport report) {
        if (report == null) return 0;
        double performance = report.getScore()         != null ? report.getScore()         : 0;
        double progress    = report.getProgressScore() != null ? report.getProgressScore() : 0;
        return (performance * 0.6) + (progress * 0.4);
    }

    // ── COMPOSANTE 2 : TEMPORELLE ────────────────────────────────────────────

    private double computeTemporalScore(Project project) {
        if (project == null) return 50;
        if (project.getStartDate() == null || project.getDeadline() == null) return 50;

        LocalDate today    = LocalDate.now();
        LocalDate start    = project.getStartDate();
        LocalDate deadline = project.getDeadline();

        if (today.isAfter(deadline)) return 0; // deadline dépassée

        long totalDays   = ChronoUnit.DAYS.between(start, deadline);
        long elapsed     = ChronoUnit.DAYS.between(start, today);
        long remaining   = ChronoUnit.DAYS.between(today, deadline);

        if (totalDays <= 0) return 100;

        double timeConsumed = (elapsed * 100.0) / totalDays;

        // Plus il reste du temps, meilleur est le score
        double score = (remaining * 100.0) / totalDays;
        return Math.min(100, Math.max(0, score));
    }

    // ── COMPOSANTE 3 : STRUCTURELLE ──────────────────────────────────────────

    private double computeStructuralScore(Project project) {
        if (project == null) return 0;
        if (project.getPhases() == null || project.getPhases().isEmpty()) return 0;

        int totalPhases = project.getPhases().size();
        long validPhases = project.getPhases().stream()
                .filter(p -> p.getTasks() != null && p.getTasks().size() >= 2)
                .count();

        long totalTasks = project.getPhases().stream()
                .mapToLong(p -> p.getTasks() != null ? p.getTasks().size() : 0)
                .sum();

        long tasksWithDesc = project.getPhases().stream()
                .flatMap(p -> p.getTasks() != null ? p.getTasks().stream()
                        : java.util.stream.Stream.empty())
                .filter(t -> t.getDescription() != null
                        && !t.getDescription().isBlank())
                .count();

        double phaseScore = totalPhases > 0
                ? (validPhases * 100.0) / totalPhases : 0;
        double descScore  = totalTasks > 0
                ? (tasksWithDesc * 100.0) / totalTasks : 0;

        return (phaseScore * 0.6) + (descScore * 0.4);
    }

    // ── COMPOSANTE 4 : RÉSOLUTION ────────────────────────────────────────────

    private double computeResolutionScore(List<AuditTicket> tickets,
                                          Integer projectId) {
        // Tickets de l'audit courant
        if (tickets.isEmpty()) return 100; // pas de tickets = parfait

        long resolved = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.RESOLVED)
                .count();
        long total = tickets.size();

        double currentResolution = (resolved * 100.0) / total;

        // Bonus : tickets des audits précédents tous résolus ?
        List<AuditScore> history = scoreRepository
                .findByProjectIdOrderByCalculatedAtAsc(projectId);

        if (history.size() >= 2) {
            double avgPrevResolution = history.stream()
                    .mapToDouble(s -> s.getResolutionScore() != null
                            ? s.getResolutionScore() : 0)
                    .average().orElse(0);
            // Pondération : 70% courant + 30% historique
            return (currentResolution * 0.7) + (avgPrevResolution * 0.3);
        }

        return currentResolution;
    }

    // ── TREND ─────────────────────────────────────────────────────────────────

    private AuditTrend computeTrend(Integer projectId, double currentScore) {
        List<AuditScore> history = scoreRepository
                .findByProjectIdOrderByCalculatedAtAsc(projectId);

        if (history.size() < 2) return AuditTrend.INSUFFICIENT_DATA;

        AuditScore prev = history.get(history.size() - 1);
        double prevScore = prev.getCompositeScore();
        double delta = currentScore - prevScore;

        if (delta <= -20) return AuditTrend.CRITICAL_DRIFT;
        if (delta < -5)   return AuditTrend.DEGRADING;
        if (delta > 5)    return AuditTrend.IMPROVING;
        return AuditTrend.STABLE;
    }

    // ── VERDICT ───────────────────────────────────────────────────────────────

    private AuditVerdict computeVerdict(double score) {
        if (score >= 80) return AuditVerdict.CERTIFIED;
        if (score >= 50) return AuditVerdict.CONDITIONAL;
        return AuditVerdict.REJECTED;
    }

    // ── NIVEAU DE CONFIANCE ───────────────────────────────────────────────────

    private double computeConfidence(AuditReport report,
                                     List<AuditTicket> tickets,
                                     Project project) {
        double confidence = 100;
        if (report == null)   confidence -= 30;
        if (tickets.isEmpty()) confidence -= 10;
        if (project == null)  confidence -= 20;
        if (project != null && project.getStartDate() == null) confidence -= 15;
        if (project != null && (project.getPhases() == null
                || project.getPhases().isEmpty())) confidence -= 15;
        return Math.max(0, confidence);
    }

    // ── VERDICT STATEMENT ─────────────────────────────────────────────────────

    private String buildVerdictStatement(AuditVerdict verdict, double score,
                                         AuditTrend trend, Audit audit,
                                         AuditReport report) {
        String date = LocalDate.now().toString();
        String projectRef = "Project #" + audit.getProjectId();
        String auditRef   = "Audit #"   + audit.getId();

        return switch (verdict) {
            case CERTIFIED -> String.format(
                    "CERTIFIED — %s | %s | Score: %.1f/100 | " +
                            "Following the audit conducted on %s, %s satisfies all quality " +
                            "requirements defined by the SmartFreelance platform. " +
                            "The project demonstrates strong performance, adequate structural " +
                            "organization, and effective ticket resolution. " +
                            "Trend: %s.",
                    auditRef, projectRef, score, date, projectRef, trend.name());

            case CONDITIONAL -> String.format(
                    "CONDITIONAL — %s | %s | Score: %.1f/100 | " +
                            "Following the audit conducted on %s, %s requires corrective " +
                            "actions within 15 days to meet SmartFreelance quality standards. " +
                            "Identified weaknesses must be addressed before the next audit. " +
                            "Trend: %s.",
                    auditRef, projectRef, score, date, projectRef, trend.name());

            case REJECTED -> String.format(
                    "REJECTED — %s | %s | Score: %.1f/100 | " +
                            "Following the audit conducted on %s, %s presents major " +
                            "deficiencies that do not meet the minimum quality threshold " +
                            "required by SmartFreelance. Immediate intervention is mandatory. " +
                            "Trend: %s.",
                    auditRef, projectRef, score, date, projectRef, trend.name());
        };
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}