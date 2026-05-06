export interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;

  category?: string;
  stack?: string[];
  complexity?: string;
  duration?: string;
}
