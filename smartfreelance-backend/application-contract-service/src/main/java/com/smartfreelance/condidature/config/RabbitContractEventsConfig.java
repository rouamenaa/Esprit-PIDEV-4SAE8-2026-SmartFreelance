package com.smartfreelance.condidature.config;

import com.smartfreelance.condidature.messaging.RabbitContractEventPublisher;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.enabled", havingValue = "true")
public class RabbitContractEventsConfig {

    @Bean
    TopicExchange contractsEventsExchange() {
        return new TopicExchange(RabbitContractEventPublisher.EXCHANGE, true, false);
    }
}
