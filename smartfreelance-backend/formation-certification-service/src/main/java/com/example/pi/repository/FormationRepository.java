package com.example.pi.repository;

import com.example.pi.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long>, JpaSpecificationExecutor<Formation> {
    Optional<Formation> findByTitle(String title);
}