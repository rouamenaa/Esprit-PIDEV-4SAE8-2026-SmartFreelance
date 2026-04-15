package com.smartfreelance.projectservice.client;

import com.smartfreelance.projectservice.dto.external.CondidatureExternalDTO;
import com.smartfreelance.projectservice.dto.external.ContratExternalDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "microservice-condidature",
        url = "${contract.service.base-url}",
        path = "/api"
)
public interface ApplicationContractClient {

    @GetMapping("/condidatures")
    List<CondidatureExternalDTO> getCandidatures(
            @RequestParam("projectId") Long projectId,
            @RequestParam(value = "status", required = false) String status
    );

    @GetMapping("/contrats/client/{clientId}/freelancer/{freelancerId}/active")
    List<ContratExternalDTO> getActiveContractsByClientAndFreelancer(
            @PathVariable("clientId") Long clientId,
            @PathVariable("freelancerId") Long freelancerId
    );
}
