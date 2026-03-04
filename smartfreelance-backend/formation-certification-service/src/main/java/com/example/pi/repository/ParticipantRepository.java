package com.example.pi.repository;

import com.example.pi.entity.Participant;
import com.example.pi.entity.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findByFormationId(Long formationId);

    long countByFormationIdAndStatus(Long formationId, ParticipantStatus status);

    long countByFormationId(Long formationId);

    Optional<Participant> findByFormationIdAndEmail(Long formationId, String email);

    /**
     * Returns rows: [yearMonth (String), count (Long)]
     * e.g. yearMonth = "2025-03"
     */
    @Query("SELECT CONCAT(YEAR(p.registrationDate), '-', LPAD(CAST(MONTH(p.registrationDate) AS string), 2, '0')), COUNT(p) " +
           "FROM Participant p " +
           "WHERE p.status = 'REGISTERED' " +
           "GROUP BY YEAR(p.registrationDate), MONTH(p.registrationDate) " +
           "ORDER BY YEAR(p.registrationDate), MONTH(p.registrationDate)")
    List<Object[]> countByMonth();

    /**
     * Count registered participants grouped by formation category.
     * Returns rows: [category (String), count (Long)]
     */
    @Query("SELECT p.formation.category, COUNT(p) FROM Participant p " +
           "WHERE p.status = 'REGISTERED' " +
           "GROUP BY p.formation.category " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> countByCategory();
}
