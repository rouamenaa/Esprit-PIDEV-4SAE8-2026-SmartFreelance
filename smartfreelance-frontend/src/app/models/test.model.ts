export interface Answer {
  id?: number;
  content: string;
  correct: boolean;
}

export interface Question {
  id?: number;
  content: string;
  points: number;
  answers: Answer[];
}

export interface Test {
  id?: number;
  title: string;
  passingScore: number;
  formationId?: number;
  formation?: { id: number };
  questions?: Question[];
}