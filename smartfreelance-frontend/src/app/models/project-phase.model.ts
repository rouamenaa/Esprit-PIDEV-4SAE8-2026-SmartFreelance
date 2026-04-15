import { Task } from './task.model';



export interface ProjectPhase {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  status: PhaseStatus;
  tasks?: Task[];
  projectId?: number; // pour la création
}


export enum PhaseStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
