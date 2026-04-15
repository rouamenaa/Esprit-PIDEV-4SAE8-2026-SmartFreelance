export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: number;
  duedate?: string;

  // clé essentielle pour lier la tâche à une phase
  phase?: { id: number };
}