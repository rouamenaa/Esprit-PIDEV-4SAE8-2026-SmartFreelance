package com.smartfreelance.projectservice.service;


import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditReport;
import com.smartfreelance.projectservice.entity.AuditTicket;
import org.springframework.stereotype.Service;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AuditPdfService {

    // Couleurs SmartFreelance
    private static final DeviceRgb PRIMARY    = new DeviceRgb(37, 99, 235);   // bleu
    private static final DeviceRgb DARK       = new DeviceRgb(15, 23, 42);    // navy
    private static final DeviceRgb SUCCESS    = new DeviceRgb(22, 163, 74);   // vert
    private static final DeviceRgb WARNING    = new DeviceRgb(217, 119, 6);   // orange
    private static final DeviceRgb DANGER     = new DeviceRgb(220, 38, 38);   // rouge
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(248, 250, 252); // fond
    private static final DeviceRgb BORDER     = new DeviceRgb(226, 232, 240); // bordure
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);

    public byte[] generateAuditPdf(Audit audit,
                                   AuditReport report,
                                   List<AuditTicket> tickets) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 40, 50);

            PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // ── HEADER ──────────────────────────────────────────────
            addHeader(doc, audit, bold, regular);

            // ── DIVIDER ─────────────────────────────────────────────
            addDivider(doc);

            // ── AUDIT INFO ──────────────────────────────────────────
            addSection(doc, "📋 Audit Information", bold);
            addInfoTable(doc, audit, bold, regular);

            // ── RÉSUMÉ EXÉCUTIF ─────────────────────────────────────
            if (report != null) {
                addSection(doc, "📊 Executive Summary", bold);
                addScoreCards(doc, report, bold, regular);
                addProgressBars(doc, report, bold, regular);
                addClassificationBadge(doc, report, bold, regular);
            }

            // ── RECOMMANDATIONS ─────────────────────────────────────
            if (report != null) {
                addSection(doc, "💡 Recommendations", bold);
                addRecommendations(doc, report, bold, regular);
            }

            // ── TICKETS ─────────────────────────────────────────────
            addSection(doc, "🎫 Anomaly Tickets (" + tickets.size() + ")", bold);
            if (tickets.isEmpty()) {
                addNoTickets(doc, regular);
            } else {
                addTicketsTable(doc, tickets, bold, regular);
            }

            // ── FOOTER ──────────────────────────────────────────────
            addFooter(doc, audit, bold, regular);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    // ── HEADER ──────────────────────────────────────────────────────────────

    private void addHeader(Document doc, Audit audit, PdfFont bold, PdfFont regular) {
        // Fond bleu header
        Table header = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(PRIMARY)
                .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(8));

        // Gauche : titre
        Cell left = new Cell()
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setPadding(20);
        left.add(new Paragraph("SmartFreelance")
                .setFont(bold).setFontSize(22).setFontColor(ColorConstants.WHITE));
        left.add(new Paragraph("Official Audit Report")
                .setFont(regular).setFontSize(12).setFontColor(ColorConstants.WHITE));

        // Droite : numéro audit
        Cell right = new Cell()
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setPadding(20)
                .setTextAlignment(TextAlignment.RIGHT);
        right.add(new Paragraph("AUDIT #" + audit.getId())
                .setFont(bold).setFontSize(16).setFontColor(ColorConstants.WHITE));
        right.add(new Paragraph(LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .setFont(regular).setFontSize(11).setFontColor(ColorConstants.WHITE));

        header.addCell(left);
        header.addCell(right);
        doc.add(header);
        doc.add(new Paragraph("\n"));
    }

    // ── DIVIDER ─────────────────────────────────────────────────────────────

    private void addDivider(Document doc) {
        doc.add(new LineSeparator(new SolidLine())
                .setStrokeColor(BORDER)
                .setMarginBottom(10));
    }

    // ── SECTION TITLE ───────────────────────────────────────────────────────

    private void addSection(Document doc, String title, PdfFont bold) {
        doc.add(new Paragraph(title)
                .setFont(bold)
                .setFontSize(14)
                .setFontColor(DARK)
                .setMarginTop(16)
                .setMarginBottom(8));
    }

    // ── INFO TABLE ──────────────────────────────────────────────────────────

    private void addInfoTable(Document doc, Audit audit,
                              PdfFont bold, PdfFont regular) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        addInfoCell(table, "Project ID",    String.valueOf(audit.getProjectId()), bold, regular);
        addInfoCell(table, "Audit Type",    audit.getAuditType().name(),          bold, regular);
        addInfoCell(table, "Status",        audit.getStatus().name(),             bold, regular);
        addInfoCell(table, "Created By",    "User #" + audit.getCreatedBy(),      bold, regular);

        doc.add(table);
        doc.add(new Paragraph("\n"));
    }

    private void addInfoCell(Table table, String label, String value,
                             PdfFont bold, PdfFont regular) {
        Cell cell = new Cell()
                .setBackgroundColor(LIGHT_GRAY)
                .setBorder(new SolidBorder(BORDER, 1))
                .setPadding(10);
        cell.add(new Paragraph(label)
                .setFont(bold).setFontSize(9).setFontColor(new DeviceRgb(100, 116, 139)));
        cell.add(new Paragraph(value)
                .setFont(bold).setFontSize(12).setFontColor(DARK));
        table.addCell(cell);
    }

    // ── SCORE CARDS ─────────────────────────────────────────────────────────

    private void addScoreCards(Document doc, AuditReport report,
                               PdfFont bold, PdfFont regular) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        addScoreCell(table, "Performance Index",
                String.format("%.1f / 100", report.getScore() != null ? report.getScore() : 0),
                getClassificationColor(report.getClassification()), bold, regular);

        addScoreCell(table, "Task Progress",
                String.format("%.1f %%", report.getProgressScore() != null ? report.getProgressScore() : 0),
                getProgressColor(report.getProgressScore()), bold, regular);

        addScoreCell(table, "Classification",
                report.getClassification() != null ? report.getClassification().replace("_", " ") : "N/A",
                getClassificationColor(report.getClassification()), bold, regular);

        doc.add(table);
        doc.add(new Paragraph("\n"));
    }

    private void addScoreCell(Table table, String label, String value,
                              DeviceRgb color, PdfFont bold, PdfFont regular) {
        Cell cell = new Cell()
                .setBorder(new SolidBorder(color, 2))
                .setPadding(14)
                .setTextAlignment(TextAlignment.CENTER);
        cell.add(new Paragraph(value)
                .setFont(bold).setFontSize(20).setFontColor(color));
        cell.add(new Paragraph(label)
                .setFont(regular).setFontSize(10)
                .setFontColor(new DeviceRgb(100, 116, 139)));
        table.addCell(cell);
    }

    // ── PROGRESS BARS (simulées en texte) ───────────────────────────────────

    private void addProgressBars(Document doc, AuditReport report,
                                 PdfFont bold, PdfFont regular) {
        addProgressBar(doc, "Task Progress",
                report.getProgressScore() != null ? report.getProgressScore() : 0,
                bold, regular);
        addProgressBar(doc, "Performance Index",
                report.getScore() != null ? report.getScore().doubleValue() : 0,
                bold, regular);
    }

    private void addProgressBar(Document doc, String label, double value,
                                PdfFont bold, PdfFont regular) {
        doc.add(new Paragraph(label + "  —  " + String.format("%.1f", value) + "%")
                .setFont(bold).setFontSize(10).setFontColor(DARK).setMarginBottom(2));

        // Track
        Table track = new Table(UnitValue.createPercentArray(
                new float[]{(float) value, (float) (100 - value)}))
                .setWidth(UnitValue.createPercentValue(100))
                .setHeight(12)
                .setMarginBottom(10);

        Cell fill = new Cell()
                .setBackgroundColor(getProgressColor(value))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        Cell empty = new Cell()
                .setBackgroundColor(BORDER)
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);

        track.addCell(fill);
        if (value < 100) track.addCell(empty);
        doc.add(track);
    }

    // ── CLASSIFICATION BADGE ────────────────────────────────────────────────

    private void addClassificationBadge(Document doc, AuditReport report,
                                        PdfFont bold, PdfFont regular) {
        if (report.getClassification() == null) return;
        DeviceRgb color = getClassificationColor(report.getClassification());

        doc.add(new Paragraph(
                "Overall Assessment: " + report.getClassification().replace("_", " "))
                .setFont(bold).setFontSize(13)
                .setFontColor(color)
                .setBackgroundColor(lighten(color))
                .setPadding(10)
                .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6))
                .setMarginBottom(10));
    }

    // ── RECOMMENDATIONS ─────────────────────────────────────────────────────

    private void addRecommendations(Document doc, AuditReport report,
                                    PdfFont bold, PdfFont regular) {
        List<String> recs = buildRecommendations(report);
        for (int i = 0; i < recs.size(); i++) {
            doc.add(new Paragraph((i + 1) + ".  " + recs.get(i))
                    .setFont(regular).setFontSize(11)
                    .setFontColor(DARK)
                    .setMarginLeft(10)
                    .setMarginBottom(4));
        }
        doc.add(new Paragraph("\n"));
    }

    private List<String> buildRecommendations(AuditReport report) {
        String classification = report.getClassification();
        double progress = report.getProgressScore() != null ? report.getProgressScore() : 0;
        double score    = report.getScore()         != null ? report.getScore()          : 0;

        if ("CRITICAL".equals(classification)) {
            return List.of(
                    "Immediately review project planning and task assignment.",
                    "Schedule an emergency meeting with the freelancer.",
                    "Consider reassigning critical tasks to unblock progress.",
                    "Re-evaluate project deadlines with the client.",
                    "Trigger a FINANCIAL audit if budget is at risk."
            );
        } else if ("MODERATE".equals(classification)) {
            return List.of(
                    "Monitor project progress closely over the next 7 days.",
                    "Ensure all phases have at least 2 tasks assigned.",
                    "Review deadlines and adjust if necessary.",
                    "Request a status update from the freelancer."
            );
        } else {
            return List.of(
                    "Project is performing well. Maintain current pace.",
                    "Continue regular check-ins to sustain performance.",
                    "Document best practices for future projects."
            );
        }
    }

    // ── TICKETS TABLE ───────────────────────────────────────────────────────

    private void addTicketsTable(Document doc, List<AuditTicket> tickets,
                                 PdfFont bold, PdfFont regular) {
        Table table = new Table(
                UnitValue.createPercentArray(new float[]{3, 2, 1.5f, 1.5f, 1.5f}))
                .setWidth(UnitValue.createPercentValue(100));

        // Header row
        String[] headers = {"Title", "Description", "Severity", "Priority", "Status"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .setBackgroundColor(PRIMARY)
                    .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                    .setPadding(8)
                    .add(new Paragraph(h)
                            .setFont(bold).setFontSize(10)
                            .setFontColor(ColorConstants.WHITE)));
        }

        // Data rows
        for (int i = 0; i < tickets.size(); i++) {
            AuditTicket t = tickets.get(i);

            DeviceRgb rowBg = i % 2 == 0 ? LIGHT_GRAY : WHITE;

            addTicketCell(table, t.getTitle()       != null ? t.getTitle()       : "-", rowBg, regular);
            addTicketCell(table, t.getDescription() != null ? t.getDescription() : "-", rowBg, regular);
            addTicketColorCell(table, t.getSeverity() != null ? t.getSeverity().name() : "-",
                    getSeverityColor(t.getSeverity() != null ? t.getSeverity().name() : ""), bold);
            addTicketCell(table, t.getPriority() != null ? t.getPriority().name() : "-", rowBg, regular);
            addTicketColorCell(table, t.getStatus() != null ? t.getStatus().name() : "-",
                    getStatusColor(t.getStatus() != null ? t.getStatus().name() : ""), bold);
        }

        doc.add(table);
    }

    private void addTicketCell(Table table, String value, DeviceRgb bg, PdfFont regular) {
        table.addCell(new Cell()
                .setBackgroundColor(bg)
                .setBorder(new SolidBorder(BORDER, 0.5f))
                .setPadding(7)
                .add(new Paragraph(value).setFont(regular).setFontSize(9).setFontColor(DARK)));
    }

    private void addTicketColorCell(Table table, String value, DeviceRgb color, PdfFont bold) {
        table.addCell(new Cell()
                .setBorder(new SolidBorder(BORDER, 0.5f))
                .setPadding(7)
                .add(new Paragraph(value)
                        .setFont(bold).setFontSize(9).setFontColor(color)));
    }

    private void addNoTickets(Document doc, PdfFont regular) {
        doc.add(new Paragraph("✅ No anomaly tickets detected. Project is clean.")
                .setFont(regular).setFontSize(11)
                .setFontColor(SUCCESS)
                .setBackgroundColor(new DeviceRgb(220, 252, 231))
                .setPadding(10)
                .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6)));
    }

    // ── FOOTER ──────────────────────────────────────────────────────────────

    private void addFooter(Document doc, Audit audit, PdfFont bold, PdfFont regular) {
        doc.add(new Paragraph("\n"));
        doc.add(new LineSeparator(new SolidLine()).setStrokeColor(BORDER));
        doc.add(new Paragraph(
                "Generated by SmartFreelance Platform  •  Audit #" + audit.getId() +
                        "  •  " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFont(regular).setFontSize(9)
                .setFontColor(new DeviceRgb(148, 163, 184))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(8));
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────

    private DeviceRgb getClassificationColor(String classification) {
        if (classification == null) return new DeviceRgb(100, 116, 139);
        return switch (classification) {
            case "HIGH_PERFORMANCE" -> SUCCESS;
            case "MODERATE"        -> WARNING;
            case "CRITICAL"        -> DANGER;
            default                -> new DeviceRgb(100, 116, 139);
        };
    }

    private DeviceRgb getProgressColor(Double value) {
        if (value == null) return WARNING;
        if (value >= 70) return SUCCESS;
        if (value >= 40) return WARNING;
        return DANGER;
    }

    private DeviceRgb getSeverityColor(String severity) {
        return switch (severity) {
            case "CRITICAL" -> DANGER;
            case "HIGH"     -> new DeviceRgb(234, 88, 12);
            case "MEDIUM"   -> WARNING;
            default         -> SUCCESS;
        };
    }

    private DeviceRgb getStatusColor(String status) {
        return switch (status) {
            case "OPEN"      -> DANGER;
            case "IN_REVIEW" -> WARNING;
            case "RESOLVED"  -> SUCCESS;
            default          -> new DeviceRgb(100, 116, 139);
        };
    }

    private DeviceRgb lighten(DeviceRgb color) {
        float[] comps = color.getColorValue();
        return new DeviceRgb(
                Math.min(comps[0] + 0.85f, 1f),
                Math.min(comps[1] + 0.85f, 1f),
                Math.min(comps[2] + 0.85f, 1f)
        );
    }
}