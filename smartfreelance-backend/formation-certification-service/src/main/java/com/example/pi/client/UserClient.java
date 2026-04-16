package com.example.pi.client;

import com.example.pi.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "micro-user")
public interface UserClient {

    @GetMapping("/auth/user/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}