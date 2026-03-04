package com.smartfreelance.condidature.exception;

public class ContratNotFoundException extends RuntimeException {

    public ContratNotFoundException(Long id) {
        super("Contrat non trouvé avec l'id: " + id);
    }
}
