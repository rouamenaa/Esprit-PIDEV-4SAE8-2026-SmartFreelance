package com.smartfreelance.condidature.controller;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.dto.ContratStatisticsDTO;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.service.ContratService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
public class ContratController {

    private final ContratService contratService;

    @GetMapping
    public ResponseEntity<List<ContratResponse>> findAll() {
        return ResponseEntity.ok(contratService.findAll());
    }

    /** Contract statistics (completed, active, client spending). Must be before /{id} so "statistics" is not matched as id. */
    @GetMapping("/statistics")
    public ResponseEntity<ContratStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(contratService.getStatistics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(contratService.findById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ContratResponse>> findByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(contratService.findByClientId(clientId));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<ContratResponse>> findByFreelancerId(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(contratService.findByFreelancerId(freelancerId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<ContratResponse>> findByStatut(@PathVariable Contrat.StatutContrat statut) {
        return ResponseEntity.ok(contratService.findByStatut(statut));
    }

    @GetMapping("/client/{clientId}/freelancer/{freelancerId}")
    public ResponseEntity<List<ContratResponse>> findByClientAndFreelancer(
            @PathVariable Long clientId,
            @PathVariable Long freelancerId
    ) {
        return ResponseEntity.ok(contratService.findByClientIdAndFreelancerId(clientId, freelancerId));
    }

    @GetMapping("/client/{clientId}/freelancer/{freelancerId}/active")
    public ResponseEntity<List<ContratResponse>> findActiveByClientAndFreelancer(
            @PathVariable Long clientId,
            @PathVariable Long freelancerId
    ) {
        return ResponseEntity.ok(contratService.findActiveByClientIdAndFreelancerId(clientId, freelancerId));
    }

    @PostMapping
    public ResponseEntity<ContratResponse> create(@Valid @RequestBody ContratRequest request) {
        ContratResponse response = contratService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ContratRequest request) {
        return ResponseEntity.ok(contratService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contratService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** GET to avoid CORS preflight. Client signs first; clientId must match contract's client. */
    @GetMapping("/{id}/sign/client")
    public ResponseEntity<ContratResponse> signByClient(
            @PathVariable Long id,
            @RequestParam Long clientId) {
        return ResponseEntity.ok(contratService.signByClient(id, clientId));
    }

    /** GET to avoid CORS preflight. Freelancer signs second; freelancerId must match contract's freelancer. */
    @GetMapping("/{id}/sign/freelancer")
    public ResponseEntity<ContratResponse> signByFreelancer(
            @PathVariable Long id,
            @RequestParam Long freelancerId) {
        return ResponseEntity.ok(contratService.signByFreelancer(id, freelancerId));
    }

    /** Cancel client signature (only if freelancer has not signed). clientId must match contract's client. */
    @GetMapping("/{id}/sign/client/cancel")
    public ResponseEntity<ContratResponse> cancelClientSign(
            @PathVariable Long id,
            @RequestParam Long clientId) {
        return ResponseEntity.ok(contratService.cancelClientSign(id, clientId));
    }

    /** Cancel freelancer signature. freelancerId must match contract's freelancer. */
    @GetMapping("/{id}/sign/freelancer/cancel")
    public ResponseEntity<ContratResponse> cancelFreelancerSign(
            @PathVariable Long id,
            @RequestParam Long freelancerId) {
        return ResponseEntity.ok(contratService.cancelFreelancerSign(id, freelancerId));
    }
}
