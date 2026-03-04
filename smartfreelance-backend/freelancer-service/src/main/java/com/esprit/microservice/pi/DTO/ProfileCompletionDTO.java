package com.esprit.microservice.pi.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ProfileCompletionDTO {

    private int percentage;
    private List<String> missingFields;
}