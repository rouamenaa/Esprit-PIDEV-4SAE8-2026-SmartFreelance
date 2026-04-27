package com.smartfreelance.projectservice.repository;

import com.smartfreelance.projectservice.entity.AuditTicket;
import com.smartfreelance.projectservice.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditTicketRepository extends JpaRepository<AuditTicket, Integer> {
    List<AuditTicket> findByAuditId(Integer auditId);
    List<AuditTicket> findByAuditIdAndStatus(Integer auditId, TicketStatus status);
}