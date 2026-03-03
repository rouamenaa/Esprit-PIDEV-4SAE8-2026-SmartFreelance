export interface PortfolioProject {
  id?: number; // @GeneratedValue(strategy = GenerationType.IDENTITY)
  
  title: string; // @NotBlank @Size(min = 3, max = 100)
  
  description: string; // @NotBlank @Size(min = 10, max = 1000)
  
  projectUrl?: string; // @Pattern(regexp = "^(https?://.*)?$") @Size(max = 255)
  
  technologiesUsed?: string; // @Size(max = 200)
  
  freelancerId?: number; // @ManyToOne @JoinColumn(name = "freelancer_id")
  freelancer?: any; // relation ManyToOne vers FreelancerProfile
}
