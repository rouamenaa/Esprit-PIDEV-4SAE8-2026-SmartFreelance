package com.smartfreelance.projectservice.repository;


import com.smartfreelance.projectservice.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditRepository extends JpaRepository<Audit, Integer> {
    List<Audit> findByProjectId(Long projectId);
}