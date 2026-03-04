export interface GlobalStatistics {
  totalFormations: number;
  totalParticipants: number;
  averagePrice: number;
  mostPopularCategory: string;
}

export interface FormationStatistics {
  formationId: number;
  title: string;
  registeredCount: number;
  cancelledCount: number;
  remainingSeats: number;
  fillRate: number;
  formationStatus: 'UPCOMING' | 'ONGOING' | 'FINISHED';
}

export interface MonthlyRegistration {
  month: string;
  count: number;
}