export type CondidatureStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Condidature {
  id: number;
  projectId: number;
  freelancerId: number;
  coverLetter?: string | null;
  proposedPrice?: number | null;
  estimatedDeliveryDays?: number | null;
  /** Freelancer rating 0–5 when available (for ranking). */
  freelancerRating?: number | null;
  status: CondidatureStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CondidatureRequest {
  projectId: number;
  freelancerId: number;
  coverLetter?: string | null;
  proposedPrice?: number | null;
  estimatedDeliveryDays?: number | null;
  freelancerRating?: number | null;
  status?: CondidatureStatus | null;
}

/** Applications count per project (for admin dashboard). */
export interface ApplicationsPerProject {
  projectId: number;
  count: number;
}

/** Freelancer success rate from freelancer_rating (average rating 0–5 → success %). */
export interface FreelancerSuccessRate {
  freelancerId: number;
  totalApplications: number;
  averageRating: number;
  successRatePercent: number;
}

/** Candidature statistics for admin dashboard. */
export interface CondidatureStats {
  totalApplications: number;
  acceptedCount: number;
  acceptanceRatePercent: number;
  applicationsPerProject: ApplicationsPerProject[];
  freelancerSuccessRates: FreelancerSuccessRate[];
}

/** Statistics related to a single candidature (for details view): project + freelancer. */
export interface CondidatureDetailStats {
  projectApplicationsCount: number;
  projectAcceptedCount: number;
  projectAcceptanceRatePercent: number;
  freelancerTotalApplications: number;
  freelancerAverageRating?: number;
  freelancerSuccessRatePercent: number;
}

