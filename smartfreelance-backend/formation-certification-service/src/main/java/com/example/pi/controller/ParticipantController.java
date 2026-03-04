package com.example.pi.controller;

import com.example.pi.dto.ParticipantRequestDTO;
import com.example.pi.dto.ParticipantResponseDTO;
import com.example.pi.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/formations/{formationId}/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    /**
     * POST /api/formations/{formationId}/participants
     * Register a new participant to a formation.
     */
    @PostMapping
    public ResponseEntity<ParticipantResponseDTO> register(
            @PathVariable Long formationId,
            @Valid @RequestBody ParticipantRequestDTO dto) {
        return ResponseEntity.ok(participantService.registerParticipant(formationId, dto));
    }

    /**
     * DELETE /api/formations/{formationId}/participants/{participantId}
     * Cancel a participant's registration.
     */
    @DeleteMapping("/{participantId}")
    public ResponseEntity<ParticipantResponseDTO> cancel(
            @PathVariable Long formationId,
            @PathVariable Long participantId) {
        return ResponseEntity.ok(participantService.cancelRegistration(formationId, participantId));
    }

    /**
     * GET /api/formations/{formationId}/participants
     * List all participants for a formation.
     */
    @GetMapping
    public ResponseEntity<List<ParticipantResponseDTO>> list(@PathVariable Long formationId) {
        return ResponseEntity.ok(participantService.getParticipantsByFormation(formationId));
    }
}
