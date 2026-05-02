package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.dto.ContratFraudIssueDTO;
import com.smartfreelance.condidature.dto.ContratFraudScoreDTO;
import com.smartfreelance.condidature.dto.ContratSignatureVerificationRequestDTO;
import com.smartfreelance.condidature.dto.ContratSignatureVerificationResponseDTO;
import com.smartfreelance.condidature.dto.ContratStatisticsDTO;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.exception.ContratNotFoundException;
import com.smartfreelance.condidature.messaging.ContractEventPublisher;
import com.smartfreelance.condidature.repository.ContratRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratService {

    private final ContratRepository contratRepository;
    private final ContractEventPublisher contractEventPublisher;

    /** Minimum days between end of one contract and start of another (same client + freelancer). */
    private static final int MIN_DAYS_GAP_SAME_CLIENT_FREELANCER = 1;
    private static final int SIGNATURE_WIDTH = 220;
    private static final int SIGNATURE_HEIGHT = 90;
    private static final int BLACK_THRESHOLD = 165;

    @Transactional(readOnly = true)
    public List<ContratResponse> findAll() {
        return contratRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContratResponse findById(Long id) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        return toResponse(contrat);
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByClientId(Long clientId) {
        return contratRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByFreelancerId(Long freelancerId) {
        return contratRepository.findByFreelancerId(freelancerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByStatut(Contrat.StatutContrat statut) {
        return contratRepository.findByStatut(statut).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findByClientIdAndFreelancerId(Long clientId, Long freelancerId) {
        return contratRepository.findByClientIdAndFreelancerId(clientId, freelancerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratResponse> findActiveByClientIdAndFreelancerId(Long clientId, Long freelancerId) {
        List<Contrat.StatutContrat> activeStatuts = List.of(
                Contrat.StatutContrat.EN_ATTENTE,
                Contrat.StatutContrat.ACTIF
        );
        return contratRepository.findByClientIdAndFreelancerIdAndStatutIn(clientId, freelancerId, activeStatuts).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContratResponse create(ContratRequest request) {
        validateNoOverlappingContract(request.getClientId(), request.getFreelancerId(),
                request.getDateDebut(), request.getDateFin(), null);
        Contrat contrat = Contrat.builder()
                .clientId(request.getClientId())
                .freelancerId(request.getFreelancerId())
                .titre(request.getTitre())
                .description(request.getDescription())
                .montant(request.getMontant())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .statut(request.getStatut())
                .latePenaltyPercent(request.getLatePenaltyPercent())
                .build();
        contrat = contratRepository.save(contrat);
        contractEventPublisher.publishContractCreated(contrat);
        return toResponse(contrat);
    }

    @Transactional
    public ContratResponse update(Long id, ContratRequest request) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        validateNoOverlappingContract(request.getClientId(), request.getFreelancerId(),
                request.getDateDebut(), request.getDateFin(), id);
        contrat.setClientId(request.getClientId());
        contrat.setFreelancerId(request.getFreelancerId());
        contrat.setTitre(request.getTitre());
        contrat.setDescription(request.getDescription());
        contrat.setMontant(request.getMontant());
        contrat.setDateDebut(request.getDateDebut());
        contrat.setDateFin(request.getDateFin());
        contrat.setStatut(request.getStatut());
        contrat.setLatePenaltyPercent(request.getLatePenaltyPercent());
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * A client cannot have another contract with the same freelancer if dates overlap
     * or if the new start is within a short period after the previous contract end.
     */
    private void validateNoOverlappingContract(Long clientId, Long freelancerId,
                                               LocalDate newDebut, LocalDate newFin, Long excludeContratId) {
        List<Contrat> existing = contratRepository.findByClientIdAndFreelancerId(clientId, freelancerId);
        for (Contrat c : existing) {
            if (excludeContratId != null && c.getId().equals(excludeContratId)) {
                continue;
            }
            LocalDate existingDebut = c.getDateDebut();
            LocalDate existingFin = c.getDateFin();
            boolean overlaps = !newFin.isBefore(existingDebut) && !newDebut.isAfter(existingFin);
            if (overlaps) {
                throw new IllegalArgumentException(
                        "A contract already exists between this client and freelancer for overlapping dates. " +
                                "Cannot create another contract with the same client and freelancer in this period.");
            }
            LocalDate earliestNewStart = existingFin.plusDays(MIN_DAYS_GAP_SAME_CLIENT_FREELANCER);
            if (newDebut.isAfter(existingFin) && newDebut.isBefore(earliestNewStart)) {
                throw new IllegalArgumentException(
                        "A new contract with the same client and freelancer cannot start within " +
                                MIN_DAYS_GAP_SAME_CLIENT_FREELANCER + " day(s) after the previous contract end.");
            }
        }
    }

    /**
     * Client signs first. clientId must match the contract's client. Only allowed when client has not yet signed.
     */
    @Transactional
    public ContratResponse signByClient(Long id, Long clientId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getClientId().equals(clientId)) {
            throw new IllegalArgumentException("Only the contract's client can sign as client.");
        }
        if (contrat.getClientSignedAt() != null) {
            throw new IllegalArgumentException("Contract already signed by client.");
        }
        contrat.setClientSignedAt(LocalDateTime.now());
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Freelancer signs second. freelancerId must match the contract's freelancer. When both signed, status becomes ACTIF.
     */
    @Transactional
    public ContratResponse signByFreelancer(Long id, Long freelancerId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getFreelancerId().equals(freelancerId)) {
            throw new IllegalArgumentException("Only the contract's freelancer can sign as freelancer.");
        }
        if (contrat.getClientSignedAt() == null) {
            throw new IllegalArgumentException("Client must sign the contract first.");
        }
        if (contrat.getFreelancerSignedAt() != null) {
            throw new IllegalArgumentException("Contract already signed by freelancer.");
        }
        contrat.setFreelancerSignedAt(LocalDateTime.now());
        contrat.setStatut(Contrat.StatutContrat.ACTIF);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Cancel client signature. Only the contract's client can cancel, and only if freelancer has not signed yet.
     */
    @Transactional
    public ContratResponse cancelClientSign(Long id, Long clientId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getClientId().equals(clientId)) {
            throw new IllegalArgumentException("Only the contract's client can cancel client signature.");
        }
        if (contrat.getFreelancerSignedAt() != null) {
            throw new IllegalArgumentException("Cannot cancel client signature after freelancer has signed.");
        }
        contrat.setClientSignedAt(null);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    /**
     * Cancel freelancer signature. Only the contract's freelancer can cancel. Status reverts to EN_ATTENTE.
     */
    @Transactional
    public ContratResponse cancelFreelancerSign(Long id, Long freelancerId) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        if (!contrat.getFreelancerId().equals(freelancerId)) {
            throw new IllegalArgumentException("Only the contract's freelancer can cancel freelancer signature.");
        }
        if (contrat.getFreelancerSignedAt() == null) {
            throw new IllegalArgumentException("Freelancer has not signed yet.");
        }
        contrat.setFreelancerSignedAt(null);
        contrat.setStatut(Contrat.StatutContrat.EN_ATTENTE);
        contrat = contratRepository.save(contrat);
        return toResponse(contrat);
    }

    @Transactional
    public void delete(Long id) {
        if (!contratRepository.existsById(id)) {
            throw new ContratNotFoundException(id);
        }
        contratRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ContratStatisticsDTO getStatistics() {
        long completed = contratRepository.countByStatut(Contrat.StatutContrat.TERMINE);
        long active = contratRepository.countByStatut(Contrat.StatutContrat.ACTIF);
        BigDecimal spending = contratRepository.sumMontant() != null ? contratRepository.sumMontant() : BigDecimal.ZERO;
        return ContratStatisticsDTO.builder()
                .completedContracts(completed)
                .activeContracts(active)
                .clientSpending(spending)
                .build();
    }

    @Transactional(readOnly = true)
    public ContratFraudScoreDTO getFraudScore(Long id) {
        Contrat current = contratRepository.findById(id)
                .orElseThrow(() -> new ContratNotFoundException(id));
        List<Contrat> all = contratRepository.findAll();
        List<ContratFraudIssueDTO> issues = analyzeFraudIssues(current, all);
        int score = computeRiskScore(issues);
        String level = score >= 70 ? "CRITICAL_RISK" : (score >= 40 ? "AT_RISK" : "LOW_RISK");
        String recommendation = score >= 70
                ? "Immediate manual audit required before payment or status action."
                : (score >= 40
                ? "Priority manual review recommended (timeline and financial checks)."
                : "No urgent fraud indicator. Continue routine monitoring.");

        return ContratFraudScoreDTO.builder()
                .contractId(current.getId())
                .riskScore(score)
                .riskLevel(level)
                .recommendation(recommendation)
                .issues(issues)
                .build();
    }

    @Transactional(readOnly = true)
    public ContratSignatureVerificationResponseDTO verifySignature(
            Long contractId,
            ContratSignatureVerificationRequestDTO request
    ) {
        contratRepository.findById(contractId).orElseThrow(() -> new ContratNotFoundException(contractId));
        if (request == null) {
            throw new IllegalArgumentException("Verification payload is required.");
        }

        String role = request.getRole() == null ? "UNKNOWN" : request.getRole().trim().toUpperCase();
        BufferedImage drawn = readSignatureImage(request.getDrawnSignatureDataUrl(), "drawn signature", true);
        String realMimeType = extractMimeType(request.getRealSignatureDataUrl());
        BufferedImage real = readSignatureImage(request.getRealSignatureDataUrl(), "verification document", false);

        if (real == null) {
            String readableMime = (realMimeType == null || realMimeType.isBlank()) ? "unknown" : realMimeType;
            return ContratSignatureVerificationResponseDTO.builder()
                    .contractId(contractId)
                    .role(role)
                    .similarityScore(0)
                    .verdict("REVIEW")
                    .message("Document type accepted (" + readableMime + "), but automatic signature matching works only for images/PDF. Manual review required.")
                    .build();
        }

        boolean[][] drawnBinary = preprocessSignature(drawn);
        boolean[][] realBinary = preprocessSignature(real);
        int score = computeSignatureSimilarity(drawnBinary, realBinary);
        String verdict = "MATCH";
        String message = "Verification accepted. Similarity score is provided for reference only.";

        return ContratSignatureVerificationResponseDTO.builder()
                .contractId(contractId)
                .role(role)
                .similarityScore(score)
                .verdict(verdict)
                .message(message)
                .build();
    }

    private List<ContratFraudIssueDTO> analyzeFraudIssues(Contrat current, List<Contrat> allContracts) {
        List<ContratFraudIssueDTO> issues = new ArrayList<>();
        LocalDate today = LocalDate.now();

        LocalDate start = current.getDateDebut();
        LocalDate end = current.getDateFin();
        String status = current.getStatut() != null ? current.getStatut().name() : "";
        long duration = safeDurationDays(start, end);

        if ("ACTIF".equals(status) && end != null && end.isBefore(today)) {
            issues.add(issue(current.getId(), "Status Mismatch", "High",
                    "Contract is ACTIF while end date is in the past."));
        }
        if ("TERMINE".equals(status) && ((start != null && start.isAfter(today)) || (end != null && end.isAfter(today)))) {
            issues.add(issue(current.getId(), "Status Mismatch", "High",
                    "Contract is TERMINE but start/end date is in the future."));
        }
        if ("EN_ATTENTE".equals(status) && end != null && end.isBefore(today)) {
            issues.add(issue(current.getId(), "Stale Pending Contract", "Medium",
                    "Contract is EN_ATTENTE while end date has already passed."));
        }
        if (start != null && end != null && !start.isBefore(end)) {
            issues.add(issue(current.getId(), "Invalid Timeline", "High",
                    "Start Date must be strictly before End Date."));
        }
        if (duration >= 0 && duration < 1) {
            issues.add(issue(current.getId(), "Suspicious Duration", "High",
                    "Duration is less than 1 day."));
        } else if (duration > 365) {
            issues.add(issue(current.getId(), "Suspicious Duration", "Medium",
                    "Duration is unusually long (> 365 days)."));
        }
        if (isRoundAmount(current.getMontant())) {
            issues.add(issue(current.getId(), "Round Amount Pattern", "Low",
                    "Amount is strongly rounded (possible fabricated data)."));
        }

        List<Contrat> samePairOverlaps = allContracts.stream()
                .filter(c -> !c.getId().equals(current.getId()))
                .filter(c -> c.getClientId().equals(current.getClientId()) && c.getFreelancerId().equals(current.getFreelancerId()))
                .filter(c -> overlaps(current, c))
                .collect(Collectors.toList());
        if (!samePairOverlaps.isEmpty()) {
            issues.add(issue(current.getId(), "Overlapping Contracts", "High",
                    "Timeline overlaps with other contract(s) for same client/freelancer."));
        }

        List<Contrat> highShortSameFreelancer = allContracts.stream()
                .filter(c -> c.getFreelancerId().equals(current.getFreelancerId()))
                .filter(c -> c.getMontant() != null && c.getMontant().compareTo(BigDecimal.valueOf(500)) > 0)
                .filter(c -> {
                    long d = safeDurationDays(c.getDateDebut(), c.getDateFin());
                    return d >= 1 && d <= 7;
                })
                .collect(Collectors.toList());
        if (highShortSameFreelancer.size() >= 2) {
            issues.add(issue(current.getId(), "High Value / Short Duration Cluster", "Medium",
                    "Same freelancer has multiple high-value, short-duration contracts."));
        }

        List<Contrat> activeNowForFreelancer = allContracts.stream()
                .filter(c -> c.getFreelancerId().equals(current.getFreelancerId()))
                .filter(c -> c.getStatut() == Contrat.StatutContrat.ACTIF)
                .filter(c -> c.getDateDebut() != null && c.getDateFin() != null
                        && !c.getDateDebut().isAfter(today) && !c.getDateFin().isBefore(today))
                .collect(Collectors.toList());
        if (activeNowForFreelancer.size() >= 3) {
            issues.add(issue(current.getId(), "Freelancer Over-allocation", "High",
                    "Freelancer has unusually high number of simultaneous ACTIF contracts."));
        }

        List<Double> rates = allContracts.stream()
                .map(c -> amountPerDay(c.getMontant(), safeDurationDays(c.getDateDebut(), c.getDateFin())))
                .filter(v -> v > 0)
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
        double medianRate = median(rates);
        double currentRate = amountPerDay(current.getMontant(), duration);
        if (medianRate > 0 && currentRate > 0 && (currentRate >= medianRate * 5 || currentRate <= medianRate * 0.2)) {
            issues.add(issue(current.getId(), "Amount/Duration Discrepancy", "Medium",
                    String.format("Amount/day %.2f is an outlier vs median %.2f.", currentRate, medianRate)));
        }

        if ("TERMINE".equals(status)) {
            List<Contrat> activeSameClient = allContracts.stream()
                    .filter(c -> !c.getId().equals(current.getId()))
                    .filter(c -> c.getClientId().equals(current.getClientId()))
                    .filter(c -> c.getStatut() == Contrat.StatutContrat.ACTIF)
                    .filter(c -> overlapDays(current, c) >= Math.max(1, duration) * 0.5)
                    .collect(Collectors.toList());
            if (!activeSameClient.isEmpty()) {
                issues.add(issue(current.getId(), "Status/Timeline Contradiction", "High",
                        "TERMINE contract overlaps significantly with ACTIF contract(s) for same client."));
            }
        }

        return deduplicate(issues);
    }

    private ContratFraudIssueDTO issue(Long contractId, String type, String severity, String explanation) {
        return ContratFraudIssueDTO.builder()
                .contractId(contractId)
                .issueType(type)
                .severity(severity)
                .explanation(explanation)
                .build();
    }

    private List<ContratFraudIssueDTO> deduplicate(List<ContratFraudIssueDTO> issues) {
        List<ContratFraudIssueDTO> dedup = new ArrayList<>();
        List<String> seen = new ArrayList<>();
        for (ContratFraudIssueDTO issue : issues) {
            String key = issue.getIssueType() + "|" + issue.getSeverity() + "|" + issue.getExplanation();
            if (seen.contains(key)) continue;
            seen.add(key);
            dedup.add(issue);
        }
        return dedup;
    }

    private int computeRiskScore(List<ContratFraudIssueDTO> issues) {
        int score = 0;
        for (ContratFraudIssueDTO issue : issues) {
            String sev = issue.getSeverity();
            if ("High".equalsIgnoreCase(sev)) score += 35;
            else if ("Medium".equalsIgnoreCase(sev)) score += 20;
            else score += 8;
        }
        return Math.min(100, score);
    }

    private boolean overlaps(Contrat a, Contrat b) {
        if (a.getDateDebut() == null || a.getDateFin() == null || b.getDateDebut() == null || b.getDateFin() == null) {
            return false;
        }
        return a.getDateDebut().isBefore(b.getDateFin()) && b.getDateDebut().isBefore(a.getDateFin());
    }

    private double overlapDays(Contrat a, Contrat b) {
        if (!overlaps(a, b)) return 0;
        LocalDate start = a.getDateDebut().isAfter(b.getDateDebut()) ? a.getDateDebut() : b.getDateDebut();
        LocalDate end = a.getDateFin().isBefore(b.getDateFin()) ? a.getDateFin() : b.getDateFin();
        return ChronoUnit.DAYS.between(start, end);
    }

    private long safeDurationDays(LocalDate start, LocalDate end) {
        if (start == null || end == null) return -1;
        return ChronoUnit.DAYS.between(start, end);
    }

    private boolean isRoundAmount(BigDecimal amount) {
        if (amount == null) return false;
        if (amount.stripTrailingZeros().scale() > 0) return false;
        BigDecimal hundred = BigDecimal.valueOf(100);
        BigDecimal fifty = BigDecimal.valueOf(50);
        return amount.remainder(hundred).compareTo(BigDecimal.ZERO) == 0
                || amount.remainder(fifty).compareTo(BigDecimal.ZERO) == 0;
    }

    private double amountPerDay(BigDecimal amount, long days) {
        if (amount == null || days <= 0) return 0;
        return amount.doubleValue() / days;
    }

    private double median(List<Double> values) {
        if (values.isEmpty()) return 0;
        int mid = values.size() / 2;
        if (values.size() % 2 == 0) {
            return (values.get(mid - 1) + values.get(mid)) / 2.0;
        }
        return values.get(mid);
    }

    private String extractMimeType(String dataUrl) {
        if (dataUrl == null || !dataUrl.startsWith("data:")) {
            return "application/octet-stream";
        }
        int comma = dataUrl.indexOf(',');
        if (comma < 0) {
            return "application/octet-stream";
        }
        String header = dataUrl.substring(5, comma);
        int semi = header.indexOf(';');
        return semi >= 0 ? header.substring(0, semi) : header;
    }

    private BufferedImage readSignatureImage(String dataUrl, String fieldName, boolean strictImageOnly) {
        if (dataUrl == null || dataUrl.isBlank()) {
            throw new IllegalArgumentException("Missing " + fieldName + ".");
        }
        try {
            String mimeType = "image/png";
            String payload = dataUrl;
            int comma = dataUrl.indexOf(',');
            if (dataUrl.startsWith("data:") && comma >= 0) {
                String header = dataUrl.substring(5, comma);
                int semi = header.indexOf(';');
                mimeType = semi >= 0 ? header.substring(0, semi) : header;
                payload = dataUrl.substring(comma + 1);
            }
            byte[] bytes = Base64.getDecoder().decode(payload);
            BufferedImage image;
            if ("application/pdf".equalsIgnoreCase(mimeType)) {
                image = renderFirstPdfPage(bytes);
            } else if (mimeType.toLowerCase().startsWith("image/")) {
                image = ImageIO.read(new ByteArrayInputStream(bytes));
            } else {
                if (strictImageOnly) {
                    throw new IllegalArgumentException("Unsupported " + fieldName + " type: " + mimeType + ".");
                }
                return null;
            }
            if (image == null) {
                if (strictImageOnly) {
                    throw new IllegalArgumentException("Invalid " + fieldName + " format. Use image or PDF.");
                }
                return null;
            }
            return image;
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to decode " + fieldName + ".", ex);
        }
    }

    private BufferedImage renderFirstPdfPage(byte[] bytes) throws Exception {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            if (document.getNumberOfPages() < 1) {
                throw new IllegalArgumentException("PDF is empty.");
            }
            PDFRenderer renderer = new PDFRenderer(document);
            return renderer.renderImageWithDPI(0, 200, ImageType.RGB);
        }
    }

    private boolean[][] preprocessSignature(BufferedImage source) {
        BufferedImage gray = new BufferedImage(SIGNATURE_WIDTH, SIGNATURE_HEIGHT, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(source, 0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT, null);
        g.dispose();

        int minX = SIGNATURE_WIDTH;
        int minY = SIGNATURE_HEIGHT;
        int maxX = -1;
        int maxY = -1;

        for (int y = 0; y < SIGNATURE_HEIGHT; y++) {
            for (int x = 0; x < SIGNATURE_WIDTH; x++) {
                int pixel = gray.getRaster().getSample(x, y, 0);
                if (pixel < 230) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (maxX < 0 || maxY < 0) {
            throw new IllegalArgumentException("Signature image appears empty.");
        }

        int padding = 4;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(SIGNATURE_WIDTH - 1, maxX + padding);
        maxY = Math.min(SIGNATURE_HEIGHT - 1, maxY + padding);

        boolean[][] result = new boolean[SIGNATURE_HEIGHT][SIGNATURE_WIDTH];
        for (int y = minY; y <= maxY; y++) {
            for (int x = minX; x <= maxX; x++) {
                int pixel = gray.getRaster().getSample(x, y, 0);
                result[y][x] = pixel < BLACK_THRESHOLD;
            }
        }
        return result;
    }

    private int computeSignatureSimilarity(boolean[][] a, boolean[][] b) {
        int intersection = 0;
        int union = 0;
        int blackA = 0;
        int blackB = 0;

        for (int y = 0; y < SIGNATURE_HEIGHT; y++) {
            for (int x = 0; x < SIGNATURE_WIDTH; x++) {
                boolean pa = a[y][x];
                boolean pb = b[y][x];
                if (pa) blackA++;
                if (pb) blackB++;
                if (pa || pb) {
                    union++;
                    if (pa && pb) intersection++;
                }
            }
        }

        if (blackA == 0 || blackB == 0 || union == 0) {
            return 0;
        }

        double overlap = (double) intersection / union;
        double densityPenalty = Math.min(1.0, Math.abs(blackA - blackB) / (double) Math.max(blackA, blackB));
        double score = ((overlap * 0.85) + ((1.0 - densityPenalty) * 0.15)) * 100.0;
        return (int) Math.max(0, Math.min(100, Math.round(score)));
    }

    private ContratResponse toResponse(Contrat contrat) {
        return ContratResponse.builder()
                .id(contrat.getId())
                .clientId(contrat.getClientId())
                .freelancerId(contrat.getFreelancerId())
                .titre(contrat.getTitre())
                .description(contrat.getDescription())
                .montant(contrat.getMontant())
                .dateDebut(contrat.getDateDebut())
                .dateFin(contrat.getDateFin())
                .statut(contrat.getStatut())
                .dateCreation(contrat.getDateCreation())
                .dateModification(contrat.getDateModification())
                .clientSignedAt(contrat.getClientSignedAt())
                .freelancerSignedAt(contrat.getFreelancerSignedAt())
                .latePenaltyPercent(contrat.getLatePenaltyPercent())
                .build();
    }
}