package com.smartfreelance.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfreelance.projectservice.entity.AuditAnalysis;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.repository.AuditAnalysisRepository;
import com.smartfreelance.projectservice.repository.AuditReportRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuditAiService {
    // Le rapport contient : score, progressScore, classification, summary

    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL = "llama3";

    private final AuditAnalysisRepository analysisRepository;
    private final AuditReportRepository reportRepository;
    private final AuditTicketRepository ticketRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AuditAiService(AuditAnalysisRepository analysisRepository,
            AuditReportRepository reportRepository,
            AuditTicketRepository ticketRepository) {
        this.analysisRepository = analysisRepository;
        this.reportRepository = reportRepository;
        this.ticketRepository = ticketRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AuditAnalysis analyzeReport(Integer reportId) {

        AuditReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        List<AuditTicket> tickets = ticketRepository.findByAuditId(report.getAuditId());

        String prompt = buildPrompt(report, tickets);

        String rawResponse = callOllama(prompt);

        AuditAnalysis analysis = parseResponse(rawResponse, reportId);
        analysis = improveQuality(analysis, report, tickets);

        return analysisRepository.save(analysis);
    }

    public AuditAnalysis getAnalysisByReport(Integer reportId) {
        AuditAnalysis analysis = analysisRepository.findTopByAuditReportIdOrderByAnalyzedAtDescIdDesc(reportId);
        if (analysis == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No analysis found for this report");
        }

        AuditReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        List<AuditTicket> tickets = ticketRepository.findByAuditId(report.getAuditId());
        AuditAnalysis improved = improveQuality(analysis, report, tickets);

        if (analysisChanged(analysis, improved)) {
            improved.setId(analysis.getId());
            improved = analysisRepository.save(improved);
        }

        return improved;
    }

    // ── PROMPT BUILDER ────────────────────────────────────────────────────

    private String buildPrompt(AuditReport report, List<AuditTicket> tickets) {

        StringBuilder sb = new StringBuilder();

        sb.append("You are a JSON API. You must respond with ONLY a JSON object, nothing else.\n");
        sb.append("No explanation. No markdown. No ```json. Just the raw JSON object.\n\n");

        sb.append("AUDIT DATA:\n");
        sb.append("- Performance Index: ").append(report.getScore()).append(" / 100\n");
        sb.append("- Task Progress: ").append(report.getProgressScore()).append("%\n");
        sb.append("- Classification: ").append(report.getClassification()).append("\n");
        sb.append("- Summary: ").append(report.getSummary()).append("\n");

        sb.append("- Tickets (").append(tickets.size()).append("):\n");
        for (AuditTicket t : tickets) {
            sb.append("  * [").append(t.getSeverity()).append("] ")
                    .append(t.getTitle()).append(" — ").append(t.getStatus()).append("\n");
        }

        sb.append("\nRespond with exactly this JSON structure:\n");
        sb.append("{\"diagnosis\":\"...\",\"recommendations\":\"item A|item B|item C\",");
        sb.append("\"correctionPlan\":\"concrete step A|concrete step B|concrete step C\",\"riskProbability\":42}\n\n");
        sb.append("Rules:\n");
        sb.append("- diagnosis: 2-3 sentences about the project health\n");
        sb.append("- recommendations: 3-5 items separated by | character\n");
        sb.append("- correctionPlan: 3-5 steps separated by | character\n");
        sb.append("- correctionPlan steps must be concrete and actionable\n");
        sb.append("- Never output placeholders like step1, step2, task1, action1, rec1, rec2\n");
        sb.append("- Every recommendation must mention a real action and context from audit data\n");
        sb.append("- Every correction step must start with a verb (Assign, Fix, Review, Validate, Monitor)\n");
        sb.append("- riskProbability: integer 0-100 (failure risk)\n");
        sb.append("- Use ONLY double quotes in JSON\n");
        sb.append("- Do NOT add any text before or after the JSON\n");

        return sb.toString();
    }

    // ── OLLAMA CALL ───────────────────────────────────────────────────────

    private String callOllama(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("model", MODEL);
            body.put("prompt", prompt);
            body.put("stream", false);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    OLLAMA_URL, request, String.class);

            // Ollama retourne { "response": "...", ... }
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("response").asText();

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI service unavailable. Make sure Ollama is running: " + e.getMessage());
        }
    }

    // ── RESPONSE PARSER ───────────────────────────────────────────────────

    private AuditAnalysis parseResponse(String rawJson, Integer reportId) {
        try {
            String cleaned = rawJson.trim();

            int start = cleaned.indexOf('{');
            int end = cleaned.lastIndexOf('}');

            if (start == -1 || end == -1) {
                throw new RuntimeException("No JSON found in response");
            }

            cleaned = cleaned.substring(start, end + 1);

            cleaned = cleaned.replaceAll("[\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F]", "");

            JsonNode node = objectMapper.readTree(cleaned);

            AuditAnalysis analysis = new AuditAnalysis();
            analysis.setAuditReportId(reportId);
            String diagnosis = node.path("diagnosis").asText("Analysis unavailable");
            String recommendations = normalizePipeList(
                    node.path("recommendations").asText(""), false);
            String correctionPlan = normalizePipeList(
                    node.path("correctionPlan").asText(""), true);

            if (recommendations.isBlank()) {
                recommendations = buildFallbackRecommendations(diagnosis);
            }
            if (correctionPlan.isBlank()) {
                correctionPlan = buildFallbackCorrectionPlan(recommendations);
            }

            analysis.setDiagnosis(diagnosis);
            analysis.setRecommendations(recommendations);
            analysis.setCorrectionPlan(correctionPlan);

            JsonNode riskNode = node.path("riskProbability");
            double risk = 50.0;
            if (!riskNode.isMissingNode()) {
                if (riskNode.isNumber()) {
                    risk = riskNode.asDouble();
                } else {
                    try {
                        risk = Double.parseDouble(riskNode.asText());
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
            analysis.setRiskProbability(Math.min(100, Math.max(0, risk)));
            analysis.setAnalyzedAt(LocalDateTime.now());

            return analysis;

        } catch (Exception e) {
            AuditAnalysis fallback = new AuditAnalysis();
            fallback.setAuditReportId(reportId);
            fallback.setDiagnosis(rawJson.length() > 800
                    ? rawJson.substring(0, 800)
                    : rawJson);
            fallback.setRecommendations("Re-analyze to get structured recommendations.");
            fallback.setCorrectionPlan("Re-analyze to get structured correction plan.");
            fallback.setRiskProbability(50.0);
            fallback.setAnalyzedAt(LocalDateTime.now());
            return fallback;
        }
    }

    private AuditAnalysis improveQuality(AuditAnalysis current,
            AuditReport report,
            List<AuditTicket> tickets) {
        AuditAnalysis improved = new AuditAnalysis();
        improved.setId(current.getId());
        improved.setAuditReportId(current.getAuditReportId());
        improved.setRiskProbability(current.getRiskProbability());
        improved.setAnalyzedAt(current.getAnalyzedAt() != null ? current.getAnalyzedAt() : LocalDateTime.now());

        String diagnosis = current.getDiagnosis() != null ? current.getDiagnosis().trim() : "";
        String recommendations = normalizePipeList(current.getRecommendations(), true);
        String correctionPlan = normalizePipeList(current.getCorrectionPlan(), true);

        if (diagnosis.isBlank() || looksLikePlaceholder(diagnosis)) {
            diagnosis = buildContextDiagnosis(report, tickets, improved.getRiskProbability());
        }

        if (recommendations.isBlank()) {
            recommendations = buildContextRecommendations(report, tickets);
        }

        if (correctionPlan.isBlank()) {
            correctionPlan = buildPlanFromRecommendations(recommendations);
        }

        improved.setDiagnosis(diagnosis);
        improved.setRecommendations(recommendations);
        improved.setCorrectionPlan(correctionPlan);
        return improved;
    }

    private String normalizePipeList(String raw, boolean strict) {
        if (raw == null || raw.isBlank()) {
            return "";
        }

        String normalized = raw
                .replace("\r", "|")
                .replace("\n", "|")
                .replace(";", "|");

        String[] tokens = normalized.split("\\|");
        List<String> items = new ArrayList<>();

        for (String token : tokens) {
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

        return String.join("|", items);
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

    private boolean looksLikePlaceholder(String text) {
        String value = text.toLowerCase();
        return value.contains("rec1") || value.contains("step1")
                || value.matches(".*\\b(rec|step|task|action|plan)\\s*\\d+\\b.*");
    }

    private String buildContextDiagnosis(AuditReport report, List<AuditTicket> tickets, Double risk) {
        long openTickets = tickets.stream().filter(t -> t.getStatus() != null && "OPEN".equals(t.getStatus().name()))
                .count();
        String classification = report.getClassification() != null ? report.getClassification() : "UNKNOWN";
        double score = report.getScore() != null ? report.getScore() : 0;
        double progress = report.getProgressScore() != null ? report.getProgressScore() : 0;
        double riskValue = risk != null ? risk : 50.0;

        return String.format(
                "Project health is %s with performance index %.1f/100 and progress %.1f%%. " +
                        "There are %d open anomaly tickets and an estimated failure risk of %.0f%%. " +
                        "Immediate corrective execution and tighter delivery control are required.",
                classification, score, progress, openTickets, riskValue);
    }

    private String buildContextRecommendations(AuditReport report, List<AuditTicket> tickets) {
        double progress = report.getProgressScore() != null ? report.getProgressScore() : 0;
        double score = report.getScore() != null ? report.getScore() : 0;
        long criticalOrHigh = tickets.stream()
                .filter(t -> t.getSeverity() != null
                        && ("CRITICAL".equals(t.getSeverity().name()) || "HIGH".equals(t.getSeverity().name())))
                .count();

        List<String> recs = new ArrayList<>();
        recs.add("Assign owners and deadlines to all open anomaly tickets, prioritizing critical blockers");
        recs.add("Run a focused remediation sprint to raise delivery quality and remove high-impact defects");
        recs.add("Add regression checks for recently fixed modules before each deployment");

        if (progress < 50) {
            recs.add("Rebalance sprint scope to accelerate task completion on delayed phases");
        }
        if (score < 60) {
            recs.add("Introduce weekly performance checkpoints with measurable quality targets");
        }
        if (criticalOrHigh > 0) {
            recs.add("Escalate unresolved critical/high anomalies to project leadership within 24 hours");
        }

        return String.join("|", recs.subList(0, Math.min(5, recs.size())));
    }

    private String buildPlanFromRecommendations(String recommendations) {
        List<String> steps = new ArrayList<>();
        for (String rec : recommendations.split("\\|")) {
            String item = rec.trim();
            if (!item.isEmpty()) {
                steps.add(item);
            }
            if (steps.size() == 5) {
                break;
            }
        }

        if (steps.isEmpty()) {
            steps.add("Assign owners and due dates to all unresolved anomaly tickets");
            steps.add("Fix critical blockers and validate fixes with targeted regression tests");
            steps.add("Replan delayed tasks and monitor daily completion status");
            steps.add("Review risk trend weekly and adjust mitigation actions");
        }
        return String.join("|", steps);
    }

    private boolean analysisChanged(AuditAnalysis original, AuditAnalysis improved) {
        return !safe(original.getDiagnosis()).equals(safe(improved.getDiagnosis()))
                || !safe(original.getRecommendations()).equals(safe(improved.getRecommendations()))
                || !safe(original.getCorrectionPlan()).equals(safe(improved.getCorrectionPlan()));
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String buildFallbackRecommendations(String diagnosis) {
        return String.join("|",
                "Prioritize critical tickets and assign clear owners",
                "Stabilize delivery scope for the current sprint",
                "Track blockers daily and escalate unresolved risks",
                "Validate each fix with targeted regression tests");
    }

    private String buildFallbackCorrectionPlan(String recommendations) {
        List<String> steps = new ArrayList<>();
        String[] recs = recommendations.split("\\|");

        for (String rec : recs) {
            String item = rec.trim();
            if (!item.isEmpty()) {
                steps.add("Execute: " + item);
            }
            if (steps.size() == 5) {
                break;
            }
        }

        if (steps.isEmpty()) {
            steps.add("Prioritize top critical defects and assign owners");
            steps.add("Fix high-impact blockers and validate with tests");
            steps.add("Review timeline variance and replan commitments");
            steps.add("Monitor risk trend weekly and adjust mitigation");
        }

        return String.join("|", steps);
    }
}
