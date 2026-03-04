export interface Skill {
  // id auto-généré (IDENTITY) côté backend
  id?: number;

  // même contraintes de nom que côté backend
  name: string;

  // niveaux autorisés par le @Pattern du backend (string pour formulaire avec '' initial)
  level: SkillLevel | string;

  // relation ManyToOne vers FreelancerProfile
  freelancerId?: number;
  freelancer?: any; // ou un type FreelancerProfile si tu veux typer plus strictement
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}