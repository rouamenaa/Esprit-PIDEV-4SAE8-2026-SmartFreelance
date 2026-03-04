package com.smartfreelance.condidature.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is handled by the API Gateway only. This service is called by the gateway;
 * adding CORS here would duplicate headers and cause "multiple values" CORS errors.
 */
@Configuration
public class WebCorsConfig {
}
