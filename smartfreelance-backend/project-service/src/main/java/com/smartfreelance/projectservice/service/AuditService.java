package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final AuditTicketRepository ticketRepository;

    public AuditService(AuditRepository auditRepository,
                        AuditTicketRepository ticketRepository) {
        this.auditRepository = auditRepository;
        this.ticketRepository = ticketRepository;
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────

    public Audit createAudit(Audit audit) {
        audit.setStatus(AuditStatus.PENDING);
        audit.setCreatedAt(LocalDateTime.now());
        return auditRepository.save(audit);
    }

    public List<Audit> getAllAudits() {
        return auditRepository.findAll();
    }

    public Audit getAuditById(Integer id) {
        return getOrThrow(id);
    }

    public List<Audit> getAuditsByProject(Long projectId) {
        return auditRepository.findByProjectId(projectId);
    }

    public void deleteAudit(Integer id) {
        Audit audit = getOrThrow(id);
        if (audit.getStatus() == AuditStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cannot delete an audit that is IN_PROGRESS");
        }
        auditRepository.deleteById(id);
    }

    // ─── CYCLE DE VIE ────────────────────────────────────────────────────────

    public Audit startAudit(Integer id) {
        Audit audit = getOrThrow(id);
        if (audit.getStatus() != AuditStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Audit must be PENDING to start");
        }
        audit.setStatus(AuditStatus.IN_PROGRESS);
        audit.setStartedAt(LocalDateTime.now());
        return auditRepository.save(audit);
    }

    public Audit closeAudit(Integer id) {
        Audit audit = getOrThrow(id);
        if (audit.getStatus() != AuditStatus.REPORTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Audit must be REPORTED (with a report) before closing");
        }

        // Vérifier qu'il n'y a plus de tickets ouverts
        List<AuditTicket> openTickets = ticketRepository
                .findByAuditIdAndStatus(id, TicketStatus.OPEN);
        if (!openTickets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "All anomaly tickets must be resolved before closing the audit");
        }

        audit.setStatus(AuditStatus.CLOSED);
        audit.setClosedAt(LocalDateTime.now());
        return auditRepository.save(audit);
    }

    // ─── HELPER ──────────────────────────────────────────────────────────────

    public Audit getOrThrow(Integer id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Audit not found with id: " + id));
    }
    public Audit saveAudit(Audit audit) {
        return auditRepository.save(audit);
    }
}