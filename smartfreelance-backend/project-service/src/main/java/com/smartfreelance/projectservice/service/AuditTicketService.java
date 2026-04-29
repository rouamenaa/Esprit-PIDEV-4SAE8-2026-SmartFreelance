package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditTicketService {

    private final AuditTicketRepository repository;
    private final AuditService auditService;

    public AuditTicketService(AuditTicketRepository repository,
                              AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    // ✅ Signature complète avec title + priority
    public AuditTicket flagAnomaly(Integer auditId, String title, String description,
                                   TicketSeverity severity, Priority priority) {
        auditService.getOrThrow(auditId);

        AuditTicket ticket = new AuditTicket();
        ticket.setAuditId(auditId);
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setSeverity(severity);
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());

        return repository.save(ticket);
    }

    public List<AuditTicket> getTicketsByAudit(Integer auditId) {
        return repository.findByAuditId(auditId);
    }

    public List<AuditTicket> getOpenTicketsByAudit(Integer auditId) {
        return repository.findByAuditIdAndStatus(auditId, TicketStatus.OPEN);
    }

    public AuditTicket getTicketById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));
    }

    public AuditTicket updateStatus(Integer id, TicketStatus newStatus) {
        AuditTicket ticket = getTicketById(id);

        if (ticket.getStatus() == TicketStatus.RESOLVED && newStatus == TicketStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A resolved ticket cannot be reopened");
        }

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        return repository.save(ticket);
    }

    public void deleteTicket(Integer id) {
        AuditTicket ticket = getTicketById(id);
        if (ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cannot delete a resolved ticket");
        }
        repository.deleteById(id);
    }
}