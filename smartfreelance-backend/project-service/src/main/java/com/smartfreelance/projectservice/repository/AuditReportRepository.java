package com.smartfreelance.projectservice.repository;


import com.smartfreelance.projectservice.entity.AuditReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditReportRepository extends JpaRepository<AuditReport, Integer> {

    List<AuditReport> findByAuditId(Integer auditId);
}