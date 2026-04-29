package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Audit;
import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.AuditStatus;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditRepository;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditServiceTest {

    private AuditRepository auditRepository;
    private AuditTicketRepository ticketRepository;
    private AuditService service;

    @BeforeEach
    void setUp() {
        auditRepository = mock(AuditRepository.class);
        ticketRepository = mock(AuditTicketRepository.class);
        service = new AuditService(auditRepository, ticketRepository);
    }

    @Test
    void shouldStartAuditSuccessfully() {
        Audit audit = new Audit();
        audit.setStatus(AuditStatus.PENDING);
        when(auditRepository.findById(1)).thenReturn(Optional.of(audit));
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Audit result = service.startAudit(1);

        assertEquals(AuditStatus.IN_PROGRESS, result.getStatus());
        verify(auditRepository).save(audit);
    }

    @Test
    void shouldThrowWhenClosingAuditWithOpenTickets() {
        Audit audit = new Audit();
        audit.setStatus(AuditStatus.REPORTED);
        when(auditRepository.findById(1)).thenReturn(Optional.of(audit));
        when(ticketRepository.findByAuditIdAndStatus(1, TicketStatus.OPEN))
                .thenReturn(List.of(new AuditTicket()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.closeAudit(1));

        assertTrue(ex.getMessage().contains("All anomaly tickets must be resolved"));
    }
}