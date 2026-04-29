package com.smartfreelance.projectservice.client;

import com.smartfreelance.projectservice.dto.external.UserExternalDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "micro-user",
        url = "${user.service.base-url}",
        path = "/auth"
)
public interface UserServiceClient {

    @GetMapping("/user/{id}")
    UserExternalDTO getUserById(@PathVariable("id") Long id);
}
