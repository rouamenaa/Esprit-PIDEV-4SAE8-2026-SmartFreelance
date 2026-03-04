package com.example.pi.controller;

import com.example.pi.entity.Formation;
import com.example.pi.service.FormationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/share")
public class ShareController {

    private final FormationService formationService;

    public ShareController(FormationService formationService) {
        this.formationService = formationService;
    }

    /**
     * Partage d'une formation sur Facebook.
     * @param id ID de la formation
     * @return Page HTML statique avec Open Graph meta tags
     */
    @GetMapping(value = "/formation/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public String shareFormation(@PathVariable Long id) {

        // Récupérer la formation par ID
        Formation formation = formationService.getById(id);
        if (formation == null) {
            throw new RuntimeException("Formation not found");
        }

        // URL publique pour Facebook (à remplacer par ngrok ou domaine réel)
        String publicUrl = "https://TON_NGROK_URL/share/formation/" + formation.getId();

        // Retourne HTML statique avec meta tags Open Graph
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">

                    <!-- Open Graph Meta Tags pour Facebook -->
                    <meta property="og:title" content="%s"/>
                    <meta property="og:description" content="%s"/>
                    <meta property="og:type" content="article"/>
                    <meta property="og:url" content="%s"/>

                    <title>%s</title>

                    <script>
                        // Redirection vers Angular après 1.2 secondes
                        setTimeout(function () {
                            window.location.href = "http://localhost:4200/formations/%d";
                        }, 1200);
                    </script>
                </head>
                <body>
                    <h3>Redirecting...</h3>
                </body>
                </html>
                """.formatted(
                escape(formation.getTitle()),
                escape(formation.getDescription()),
                publicUrl,
                escape(formation.getTitle()),
                formation.getId()
        );
    }

    /**
     * Échappe les caractères spéciaux HTML pour sécurité
     */
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}