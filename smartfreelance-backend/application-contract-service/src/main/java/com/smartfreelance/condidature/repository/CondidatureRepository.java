package com.smartfreelance.condidature.repository;

import com.smartfreelance.condidature.model.Condidature;
import com.smartfreelance.condidature.model.Condidature.CondidatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CondidatureRepository extends JpaRepository<Condidature, Long> {

    @Query("SELECT DISTINCT c.projectId FROM Condidature c ORDER BY c.projectId")
    List<Long> findDistinctProjectIds();

    List<Condidature> findByProjectId(Long projectId);

    List<Condidature> findByFreelancerId(Long freelancerId);

    List<Condidature> findByProjectIdAndStatus(Long projectId, CondidatureStatus status);

    List<Condidature> findByFreelancerIdAndStatus(Long freelancerId, CondidatureStatus status);

    Optional<Condidature> findByProjectIdAndFreelancerId(Long projectId, Long freelancerId);

    boolean existsByProjectIdAndFreelancerId(Long projectId, Long freelancerId);

    /** True if the freelancer has at least one condidature with the given status (e.g. ACCEPTED). */
    boolean existsByFreelancerIdAndStatus(Long freelancerId, CondidatureStatus status);
}
