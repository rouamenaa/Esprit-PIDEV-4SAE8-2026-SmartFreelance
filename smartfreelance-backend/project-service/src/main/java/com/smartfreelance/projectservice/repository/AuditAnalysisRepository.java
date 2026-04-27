package com.smartfreelance.projectservice.repository;


import com.smartfreelance.projectservice.entity.AuditAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuditAnalysisRepository extends JpaRepository<AuditAnalysis, Integer> {
    Optional<AuditAnalysis> findByAuditReportId(Integer auditReportId);
}