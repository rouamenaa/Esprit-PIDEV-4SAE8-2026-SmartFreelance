package com.smartfreelance.condidature.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratStatisticsDTO {

    /** Number of contracts with status TERMINE. */
    private long completedContracts;

    /** Number of contracts with status ACTIF. */
    private long activeContracts;

    /** Total amount (sum of montant) across all contracts (client spending). */
    private BigDecimal clientSpending;
}
