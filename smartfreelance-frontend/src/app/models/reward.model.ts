export interface Reward {
  id?: number;
  name: string;
  type: string;
  level: string;
  minScoreRequired: number;
  iconUrl?: string;
  formationId?: number;
  formation?: { id: number };
}