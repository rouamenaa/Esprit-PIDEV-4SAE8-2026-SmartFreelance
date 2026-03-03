package com.esprit.microservice.pi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PiApplication.class, args);

        // Message optionnel pour confirmer le démarrage
        System.out.println("========================================");
        System.out.println("Application PI démarrée avec succès!");
        System.out.println("Serveur démarré sur le port 8080");
        System.out.println("API disponible: http://localhost:8080");
        System.out.println("========================================");
    }

}