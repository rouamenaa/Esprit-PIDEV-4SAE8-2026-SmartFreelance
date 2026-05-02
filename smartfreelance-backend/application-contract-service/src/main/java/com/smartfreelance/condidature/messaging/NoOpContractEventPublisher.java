package com.smartfreelance.condidature.messaging;

import com.smartfreelance.condidature.model.Contrat;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "spring.rabbitmq.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpContractEventPublisher implements ContractEventPublisher {

    @Override
    public void publishContractCreated(Contrat contrat) {
        // no-op for local / tests
    }
}
