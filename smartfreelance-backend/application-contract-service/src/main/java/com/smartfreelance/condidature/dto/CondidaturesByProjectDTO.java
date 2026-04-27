package com.smartfreelance.condidature.dto;

import lombok.*;

import java.util.List;

/**
 * Condidatures grouped by project for list view "by project".
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondidaturesByProjectDTO {

    private Long projectId;
    private List<CondidatureDTO> condidatures;
}
