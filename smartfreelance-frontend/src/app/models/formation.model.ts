export interface Formation {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  maxParticipants?: number;
  category?: string;
  dynamicStatus?: 'UPCOMING' | 'ONGOING' | 'FINISHED';
  dynamicPrice?: number;
}