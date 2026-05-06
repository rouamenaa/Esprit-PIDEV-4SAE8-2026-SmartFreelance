export interface Reward {
  id: number;
  name: string;
  type: string;
  formationId?: number;
  formation?: { id: number };
}