export interface Course {
  id: number;
  title: string;
  content?: string;
  videoUrl?: string;
  formationId?: number;
  formation?: { id: number };
}