package com.smartfreelance.condidature.messaging;

import com.smartfreelance.condidature.model.Contrat;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.rabbitmq.enabled", havingValue = "true")
public class RabbitContractEventPublisher implements ContractEventPublisher {

    public static final String EXCHANGE = "contracts.events";
    public static final String ROUTING_KEY_CREATED = "contract.created";

    private final RabbitTemplate rabbitTemplate;

    @Value("${spring.application.name:microservice-condidature}")
    private String applicationName;

    @Override
    public void publishContractCreated(Contrat contrat) {
        Map<String, Object> payload = Map.of(
                "eventType", "CONTRACT_CREATED",
                "source", applicationName,
                "contractId", contrat.getId(),
                "clientId", contrat.getClientId(),
                "freelancerId", contrat.getFreelancerId()
        );
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY_CREATED, payload);
    }
}
