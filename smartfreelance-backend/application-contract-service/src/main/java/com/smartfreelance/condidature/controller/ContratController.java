package com.smartfreelance.condidature.controller;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
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
//@CrossOrigin(origins = "http://localhost:4200")
public class ContratController {

    private final ContratService contratService;

    @GetMapping
    public ResponseEntity<List<ContratResponse>> findAll() {
        return ResponseEntity.ok(contratService.findAll());
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
}
