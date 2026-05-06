export interface Test {
  id: number;
  title: string;
  totalScore: number;
  formationId?: number;
  formation?: { id: number };
}