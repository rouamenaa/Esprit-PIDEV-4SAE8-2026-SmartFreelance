# SmartFreelance – Freelance Project Management Platform

## Overview

This project was developed as part of the **PIDEV – 3rd Year Engineering Program** at **Esprit School of Engineering** (Academic Year 2025–2026).

SmartFreelance is a full-stack web application designed to help freelancers and project managers plan, track, and deliver projects efficiently. The platform provides end-to-end project lifecycle management — from creation and phase planning to task tracking and AI-powered analysis — all within a unified, professional interface.

---

## Features

- **Project Management** — Create, approve, start, deliver, and complete projects with a structured status workflow (DRAFT → APPROVED → IN_PROGRESS → DELIVERED → COMPLETED)
- **Phase Planning** — Organize projects into phases with start/end dates, status tracking, and inline editing
- **Gantt Timeline** — Visual timeline of all project phases with color-coded status bars, task completion indicators, and a real-time "Today" marker
- **Task Management** — Create, edit, delete, and filter tasks per phase with priority levels (LOW / MEDIUM / HIGH) and status tracking (TODO / IN_PROGRESS / DONE)
- **Project Progress Tracking** — Live task completion rate with deadline countdown, days remaining, and on-track/overdue status indicators
- **Performance Analysis** — Multi-criteria performance index combining work progress (50%), time alignment (30%), and structure score (20%), classified as HIGH_PERFORMANCE / MODERATE / CRITICAL
- **AI Analysis (NLP)** — Automatic project categorization, tech stack suggestion, complexity estimation, and duration prediction from the project description
- **Formations & Courses** — Learning module management with formation lists, course details, and statistics
- **Tests & Rewards** — Assessment and gamification features linked to formations
- **Freelancer Profile & Portfolio** — Profile management, skills, and portfolio showcase
- **Project Applications & Contracts** — Candidature and contract management modules
- **Authentication & Authorization** — Login system with role-based access control and route guards
- **Smart Delete Modals** — Custom HTML confirmation modals replacing native browser `confirm()` dialogs
- **Input Validation** — Reactive form validation with disabled submit buttons, inline error messages, and date range checks

---

## Tech Stack

### Frontend

| Technology | Usage |
|---|---|
| Angular 17+ (Standalone Components) | SPA Framework |
| Angular Material | UI Component Library |
| Angular Reactive Forms | Form validation and control |
| RxJS | Reactive data streams |
| TypeScript | Strongly typed logic |
| CSS3 (custom) | Component-level styling |

### Backend

| Technology | Usage |
|---|---|
| Spring Boot 3 | REST API Framework |
| Spring Data JPA | Database ORM |
| Hibernate | Entity management |
| MySQL | Relational database |
| Java 17 | Backend language |
| NLP Microservice | AI-powered project description analysis |

---

## Architecture

SmartFreelance follows a **microservice-inspired layered architecture**:

```
smartfreelance-frontend/          # Angular SPA
├── core/
│   ├── layout/                   # Main layout (navbar + sidebar)
│   ├── auth-layout/              # Auth layout (login, signup, home)
│   └── guards/                   # Route guards (authGuard)
├── features/
│   ├── projects/                 # Project CRUD, detail, phases, tasks
│   ├── formation/                # Formation management
│   ├── course/                   # Course management
│   ├── tests/                    # Test management
│   ├── rewards/                  # Reward management
│   ├── condidature/              # Project applications
│   ├── Contract/                 # Contract management
│   ├── freelancer-profile/       # Freelancer profile
│   ├── portfolio-project/        # Portfolio
│   └── skill/                    # Skills
├── auth/                         # Login, unauthorized
└── home/                         # Landing page

smartfreelance-backend/           # Spring Boot Microservice
├── projectservice/               # Project, Phase, Task entities + performance logic
└── nlp-service/                  # AI description analysis (category, stack, complexity)
```

**Routing Strategy:** Two layout groups — `LayoutComponent` (with navbar/sidebar) for authenticated app routes, and direct routes for `login`, `home`, and `unauthorized`.

---

## Contributors

| Name | Role |
|---|---|
| [Your Name] | Full-Stack Developer – Project Module, Performance Analysis, Gantt Timeline, AI Integration |
| [Teammate 2] | Full-Stack Developer – Formations, Courses, Tests, Rewards |
| [Teammate 3] | Full-Stack Developer – Freelancer Profile, Portfolio, Skills |
| [Teammate 4] | Full-Stack Developer – Applications, Contracts |
| [Teammate 5] | Full-Stack Developer – Authentication, Admin Dashboard |

---

## Academic Context

Developed at **Esprit School of Engineering – Tunisia**
**PIDEV – 3A | 2025–2026**

This project is part of the **Projet d'Intégration et de Développement** (PIDEV), a capstone engineering project requiring the design and implementation of a complete software solution integrating multiple technologies, modules, and team members.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI 17+
- Java 17+
- Maven 3.8+
- MySQL 8+

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-org/smartfreelance.git

# Install dependencies
cd smartfreelance-frontend
npm install

# Run the development server
ng serve
```

App will be available at `http://localhost:4200`

### Backend Setup

```bash
cd smartfreelance-backend/projectservice

# Configure your database in application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/smartfreelance

# Run the Spring Boot application
mvn spring-boot:run
```

API will be available at `http://localhost:8080`

---

## Acknowledgments

- **Esprit School of Engineering** for academic supervision and project framework
- **Angular Team** for the powerful standalone component architecture
- **Spring Boot Team** for the robust backend ecosystem
- All open-source contributors whose libraries made this project possible
