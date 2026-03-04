import { Skill } from './skill.model';
import { PortfolioProject } from './portfolio-project.model';

export interface FreelancerProfile {
  // même id que l'utilisateur (Long côté backend) - optionnel pour formulaire de création
  id?: number;

  firstName: string;
  lastName: string;
  title: string;

  // overview est facultatif côté backend (pas de @NotBlank/@NotNull)
  overview?: string;

  // BigDecimal côté backend, number côté Angular
  hourlyRate: number;

  experienceLevel: string;
  availability: string;
  country: string;

  // @Size(min = 1) côté backend → optionnel pour formulaire, le backend valide
  skills?: Skill[];

  // pas de contrainte @Size côté backend → facultatif
  projects?: PortfolioProject[];
}