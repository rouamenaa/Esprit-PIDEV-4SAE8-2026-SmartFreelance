package com.smartfreelance.condidature.service;

import com.smartfreelance.condidature.dto.ContratRequest;
import com.smartfreelance.condidature.dto.ContratResponse;
import com.smartfreelance.condidature.dto.ContratStatisticsDTO;
import com.smartfreelance.condidature.exception.ContratNotFoundException;
import com.smartfreelance.condidature.model.Contrat;
import com.smartfreelance.condidature.messaging.ContractEventPublisher;
import com.smartfreelance.condidature.repository.ContratRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContratServiceTest {

    @Mock
    private ContratRepository contratRepository;

    @Mock
    private ContractEventPublisher eventPublisher;

    @InjectMocks
    private ContratService contratService;

    private ContratRequest request;

    @BeforeEach
    void setUp() {
        request = ContratRequest.builder()
                .clientId(1L)
                .freelancerId(2L)
                .titre("Mobile app")
                .description("Create Android and iOS app")
                .montant(new BigDecimal("2500.00"))
                .dateDebut(LocalDate.of(2026, 5, 1))
                .dateFin(LocalDate.of(2026, 5, 20))
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();
    }

    @Test
    void createThrowsWhenDateRangesOverlap() {
        Contrat existing = Contrat.builder()
                .id(8L)
                .clientId(1L)
                .freelancerId(2L)
                .dateDebut(LocalDate.of(2026, 5, 10))
                .dateFin(LocalDate.of(2026, 5, 25))
                .statut(Contrat.StatutContrat.ACTIF)
                .build();
        when(contratRepository.findByClientIdAndFreelancerId(1L, 2L)).thenReturn(List.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> contratService.create(request));
        assertTrue(ex.getMessage().contains("overlapping dates"));
        verify(contratRepository, never()).save(any());
        verify(eventPublisher, never()).publishContractCreated(any());
    }

    @Test
    void createPublishesContractCreatedEvent() {
        when(contratRepository.findByClientIdAndFreelancerId(1L, 2L)).thenReturn(List.of());
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> {
            Contrat c = invocation.getArgument(0);
            c.setId(42L);
            return c;
        });

        ContratResponse response = contratService.create(request);

        assertNotNull(response);
        assertEquals(42L, response.getId());
        verify(eventPublisher).publishContractCreated(any(Contrat.class));
    }

    @Test
    void signByFreelancerThrowsWhenClientDidNotSignFirst() {
        Contrat contrat = Contrat.builder()
                .id(5L)
                .clientId(1L)
                .freelancerId(2L)
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();
        when(contratRepository.findById(5L)).thenReturn(Optional.of(contrat));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> contratService.signByFreelancer(5L, 2L));
        assertEquals("Client must sign the contract first.", ex.getMessage());
    }

    @Test
    void signByFreelancerSetsSignatureAndActivatesContract() {
        Contrat contrat = Contrat.builder()
                .id(6L)
                .clientId(1L)
                .freelancerId(2L)
                .clientSignedAt(LocalDateTime.now().minusHours(2))
                .statut(Contrat.StatutContrat.EN_ATTENTE)
                .build();
        when(contratRepository.findById(6L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratResponse response = contratService.signByFreelancer(6L, 2L);

        assertNotNull(response.getFreelancerSignedAt());
        assertEquals(Contrat.StatutContrat.ACTIF, response.getStatut());
    }

    @Test
    void getStatisticsReturnsZeroWhenRepositorySumIsNull() {
        when(contratRepository.countByStatut(Contrat.StatutContrat.TERMINE)).thenReturn(3L);
        when(contratRepository.countByStatut(Contrat.StatutContrat.ACTIF)).thenReturn(2L);
        when(contratRepository.sumMontant()).thenReturn(null);

        ContratStatisticsDTO stats = contratService.getStatistics();

        assertEquals(3L, stats.getCompletedContracts());
        assertEquals(2L, stats.getActiveContracts());
        assertEquals(BigDecimal.ZERO, stats.getClientSpending());
    }

    @Test
    void deleteThrowsWhenContractDoesNotExist() {
        when(contratRepository.existsById(999L)).thenReturn(false);

        assertThrows(ContratNotFoundException.class, () -> contratService.delete(999L));
        verify(contratRepository, never()).deleteById(999L);
    }
}
