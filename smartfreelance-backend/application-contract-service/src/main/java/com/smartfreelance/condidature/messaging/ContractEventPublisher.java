package com.smartfreelance.condidature.messaging;

import com.smartfreelance.condidature.model.Contrat;

public interface ContractEventPublisher {

    void publishContractCreated(Contrat contrat);
}
