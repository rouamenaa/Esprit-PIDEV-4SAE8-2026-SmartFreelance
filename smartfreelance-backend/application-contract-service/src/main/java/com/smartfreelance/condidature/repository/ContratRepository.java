package com.smartfreelance.condidature.repository;

import com.smartfreelance.condidature.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {

    List<Contrat> findByClientId(Long clientId);
    List<Contrat> findByFreelancerId(Long freelancerId);
    List<Contrat> findByStatut(Contrat.StatutContrat statut);
    List<Contrat> findByClientIdAndFreelancerId(Long clientId, Long freelancerId);
    List<Contrat> findByClientIdAndFreelancerIdAndStatutIn(
            Long clientId,
            Long freelancerId,
            List<Contrat.StatutContrat> statuts
    );
}
