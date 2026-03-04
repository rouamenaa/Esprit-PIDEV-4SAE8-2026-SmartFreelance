/** Matches Spring Boot entity com.smartfreelance.contrat.entity.Contrat */
export type StatutContrat = 'BROUILLON' | 'EN_ATTENTE' | 'ACTIF' | 'TERMINE' | 'ANNULE';

export interface Contrat {
  id?: number;
  clientId: number;
  freelancerId: number;
  titre: string;
  description?: string;
  montant: number;
  dateDebut: string;   // ISO date (yyyy-MM-dd)
  dateFin: string;    // ISO date (yyyy-MM-dd)
  statut: StatutContrat;
  dateCreation?: string;   // ISO date-time (backend set)
  dateModification?: string; // ISO date-time (backend set)
}

/** Alias for backward compatibility */
export type Contract = Contrat;
