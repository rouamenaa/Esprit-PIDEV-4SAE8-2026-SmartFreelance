package com.smartfreelance.projectservice.repository;


import com.smartfreelance.projectservice.entity.AuditAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditAnalysisRepository extends JpaRepository<AuditAnalysis, Integer> {
    AuditAnalysis findTopByAuditReportIdOrderByAnalyzedAtDescIdDesc(Integer auditReportId);
}
