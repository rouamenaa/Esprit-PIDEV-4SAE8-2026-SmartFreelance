package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.Priority;
import com.smartfreelance.projectservice.enums.TicketSeverity;
import com.smartfreelance.projectservice.enums.TicketStatus;
import com.smartfreelance.projectservice.repository.AuditTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditTicketServiceTest {

    private AuditTicketRepository repository;
    private AuditService auditService;
    private AuditTicketService service;

    @BeforeEach
    void setUp() {
        repository = mock(AuditTicketRepository.class);
        auditService = mock(AuditService.class);
        service = new AuditTicketService(repository, auditService);
    }

    // ✅ Test création ticket normal
    @Test
    void shouldFlagAnomalySuccessfully() {
        when(auditService.getOrThrow(1)).thenReturn(null);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuditTicket ticket = service.flagAnomaly(1, "Title", "Desc",
                TicketSeverity.CRITICAL, Priority.HIGH);

        assertNotNull(ticket);
        assertEquals(TicketStatus.OPEN, ticket.getStatus());
        verify(repository, times(1)).save(any());
    }

    // ✅ Test exception si ticket RESOLVED est réouvert
    @Test
    void shouldThrowWhenReopeningResolvedTicket() {
        AuditTicket ticket = new AuditTicket();
        ticket.setStatus(TicketStatus.RESOLVED);
        when(repository.findById(1)).thenReturn(Optional.of(ticket));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.updateStatus(1, TicketStatus.OPEN));

        assertTrue(ex.getMessage().contains("cannot be reopened"));
    }

    // ✅ Test suppression ticket RESOLVED
    @Test
    void shouldThrowWhenDeletingResolvedTicket() {
        AuditTicket ticket = new AuditTicket();
        ticket.setStatus(TicketStatus.RESOLVED);
        when(repository.findById(1)).thenReturn(Optional.of(ticket));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.deleteTicket(1));

        assertTrue(ex.getMessage().contains("Cannot delete a resolved ticket"));
    }
}