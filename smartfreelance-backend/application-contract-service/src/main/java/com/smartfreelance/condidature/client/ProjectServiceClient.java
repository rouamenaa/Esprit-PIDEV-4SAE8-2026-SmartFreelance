package com.smartfreelance.condidature.client;

import com.smartfreelance.condidature.dto.AssignFreelancerRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "project-service",
        url = "${project.service.base-url}",
        path = "/api/projects"
)
public interface ProjectServiceClient {

    @PutMapping("/{id}/assign-freelancer")
    void assignFreelancer(@PathVariable("id") Long projectId,
                          @RequestBody AssignFreelancerRequestDTO request);
}
