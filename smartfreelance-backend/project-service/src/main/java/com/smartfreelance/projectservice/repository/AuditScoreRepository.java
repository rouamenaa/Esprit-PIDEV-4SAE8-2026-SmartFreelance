package com.smartfreelance.projectservice.repository;

import com.smartfreelance.projectservice.entity.AuditScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AuditScoreRepository extends JpaRepository<AuditScore, Integer> {

    Optional<AuditScore> findByAuditId(Integer auditId);

    List<AuditScore> findByProjectIdOrderByCalculatedAtAsc(Integer projectId);

    @Query("SELECT AVG(a.compositeScore) FROM AuditScore a WHERE a.compositeScore IS NOT NULL")
    Double findPlatformAverage();

    @Query("SELECT AVG(a.compositeScore) FROM AuditScore a WHERE a.projectId = :projectId")
    Double findProjectAverage(Integer projectId);

    List<AuditScore> findTop3ByProjectIdOrderByCalculatedAtDesc(Integer projectId);
}