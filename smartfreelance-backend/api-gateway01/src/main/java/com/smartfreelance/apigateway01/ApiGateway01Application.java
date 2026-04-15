package com.smartfreelance.apigateway01;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient

public class ApiGateway01Application {

    public static void main(String[] args) {
        SpringApplication.run(ApiGateway01Application.class, args);
    }

}
