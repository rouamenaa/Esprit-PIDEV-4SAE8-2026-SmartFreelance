import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContratService } from '../../../services/contrat.service';
import { ContractStatistics, Contrat } from '../../../models/Contract';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';

type FraudSeverity = 'High' | 'Medium' | 'Low';

interface FraudIssue {
  contractId: number;
  issueType: string;
  severity: FraudSeverity;
  explanation: string;
}

@Component({
  selector: 'app-contract-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-statistics.component.html',
  styleUrl: './contract-statistics.component.css',
})
export class ContractStatisticsComponent implements OnInit {
  stats: ContractStatistics | null = null;
  contracts: Contrat[] = [];
  fraudIssues: FraudIssue[] = [];
  auditSummary = '';
  loading = true;
  error: string | null = null;

  constructor(
    private contratService: ContratService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    forkJoin({
      stats: this.contratService.getStatistics(),
      contracts: this.contratService.getAll(),
      users: this.http.get<any[]>('http://localhost:8085/auth/all'),
    }).subscribe({
      next: ({ stats, contracts, users }) => {
        this.stats = stats;
        this.contracts = contracts ?? [];
        this.fraudIssues = this.analyzeFraud(this.contracts, users ?? []);
        this.auditSummary = this.buildAuditSummary(this.fraudIssues);
        this.loading = false;
      },
      error: (err) => {
        // Keep statistics page usable even if user-service is unavailable.
        this.contratService.getStatistics().subscribe({
          next: (data) => {
            this.stats = data;
            this.loadContractsWithoutUsers();
          },
          error: () => {
            this.error = err?.message || 'Error loading statistics.';
            this.loading = false;
          },
        });
      },
    });
  }

  private loadContractsWithoutUsers(): void {
    this.contratService.getAll().subscribe({
      next: (contracts) => {
        this.contracts = contracts ?? [];
        this.fraudIssues = this.analyzeFraud(this.contracts, []);
        this.auditSummary = this.buildAuditSummary(this.fraudIssues);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error loading contracts.';
        this.loading = false;
      },
    });
  }

  private analyzeFraud(contracts: Contrat[], users: any[]): FraudIssue[] {
    const issues: FraudIssue[] = [];
    const now = new Date();
    const userNameById = this.buildUserNameMap(users);

    const durationInDays = (c: Contrat): number => {
      const start = this.parseDate(c.dateDebut);
      const end = this.parseDate(c.dateFin);
      if (!start || !end) return NaN;
      return (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    };

    const overlaps = (a: Contrat, b: Contrat): boolean => {
      const aStart = this.parseDate(a.dateDebut);
      const aEnd = this.parseDate(a.dateFin);
      const bStart = this.parseDate(b.dateDebut);
      const bEnd = this.parseDate(b.dateFin);
      if (!aStart || !aEnd || !bStart || !bEnd) return false;
      return aStart < bEnd && bStart < aEnd;
    };

    // Rule 1 + 2 + 3 base checks on each contract.
    for (const c of contracts) {
      const id = c.id ?? -1;
      if (id < 0) continue;
      const start = this.parseDate(c.dateDebut);
      const end = this.parseDate(c.dateFin);
      const status = (c.statut ?? '').toUpperCase();
      const days = durationInDays(c);

      if (status === 'ACTIF' && end && end < now) {
        issues.push({
          contractId: id,
          issueType: 'Status Mismatch',
          severity: 'High',
          explanation: 'Contract is ACTIF but end date is already in the past.',
        });
      }

      if (status === 'TERMINE' && ((start && start > now) || (end && end > now))) {
        issues.push({
          contractId: id,
          issueType: 'Status Mismatch',
          severity: 'High',
          explanation: 'Contract is TERMINE but start/end date is in the future.',
        });
      }

      if (status === 'EN_ATTENTE' && end && end < now) {
        issues.push({
          contractId: id,
          issueType: 'Stale Pending Contract',
          severity: 'Medium',
          explanation: 'Contract is EN_ATTENTE while end date has already passed.',
        });
      }

      if (start && end && start >= end) {
        issues.push({
          contractId: id,
          issueType: 'Invalid Timeline',
          severity: 'High',
          explanation: 'Start Date must be strictly before End Date.',
        });
      }

      if (Number.isFinite(days) && days < 1) {
        issues.push({
          contractId: id,
          issueType: 'Suspicious Duration',
          severity: 'High',
          explanation: 'Contract duration is less than 1 day.',
        });
      } else if (Number.isFinite(days) && days > 365) {
        issues.push({
          contractId: id,
          issueType: 'Suspicious Duration',
          severity: 'Medium',
          explanation: 'Contract duration is unusually long (> 365 days).',
        });
      }

      if (this.isRoundAmount(c.montant)) {
        issues.push({
          contractId: id,
          issueType: 'Round Amount Pattern',
          severity: 'Low',
          explanation: `Amount ${c.montant} is a strongly rounded number (possible fabricated value).`,
        });
      }
    }

    // High-value short duration by same freelancer.
    const byFreelancer = this.groupBy(contracts, (c) => c.freelancerId);
    for (const [freelancerId, list] of byFreelancer.entries()) {
      const suspicious = list.filter((c) => c.montant > 500 && durationInDays(c) >= 1 && durationInDays(c) <= 7);
      if (suspicious.length >= 2) {
        for (const c of suspicious) {
          if (!c.id) continue;
          issues.push({
            contractId: c.id,
            issueType: 'High Value / Short Duration Cluster',
            severity: 'Medium',
            explanation: `Freelancer #${freelancerId} has multiple high-value contracts (>500) with short duration (<= 7 days).`,
          });
        }
      }
    }

    // Overlap same freelancer + same client.
    const byClientFreelancer = this.groupBy(contracts, (c) => `${c.clientId}-${c.freelancerId}`);
    for (const list of byClientFreelancer.values()) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (overlaps(list[i], list[j])) {
            const leftId = list[i].id;
            const rightId = list[j].id;
            if (typeof leftId === 'number') {
              issues.push({
                contractId: leftId,
                issueType: 'Overlapping Contracts',
                severity: 'High',
                explanation: `Timeline overlaps with contract #${rightId ?? 'unknown'} for the same client and freelancer.`,
              });
            }
            if (typeof rightId === 'number') {
              issues.push({
                contractId: rightId,
                issueType: 'Overlapping Contracts',
                severity: 'High',
                explanation: `Timeline overlaps with contract #${leftId ?? 'unknown'} for the same client and freelancer.`,
              });
            }
          }
        }
      }
    }

    // Too many simultaneous ACTIF contracts for one freelancer.
    const actifsByFreelancer = this.groupBy(
      contracts.filter((c) => (c.statut ?? '').toUpperCase() === 'ACTIF'),
      (c) => c.freelancerId
    );
    for (const [freelancerId, list] of actifsByFreelancer.entries()) {
      const activeNow = list.filter((c) => {
        const start = this.parseDate(c.dateDebut);
        const end = this.parseDate(c.dateFin);
        return !!start && !!end && start <= now && end >= now;
      });
      if (activeNow.length >= 3) {
        for (const c of activeNow) {
          if (!c.id) continue;
          issues.push({
            contractId: c.id,
            issueType: 'Freelancer Over-allocation',
            severity: 'High',
            explanation: `Freelancer #${freelancerId} has ${activeNow.length} simultaneous ACTIF contracts.`,
          });
        }
      }
    }

    // Amount-duration discrepancy via amount/day outlier.
    const validRates = contracts
      .map((c) => ({ c, days: durationInDays(c) }))
      .filter((x) => x.days > 0)
      .map((x) => x.c.montant / x.days);
    const medianRate = this.median(validRates);
    if (medianRate > 0) {
      for (const c of contracts) {
        const days = durationInDays(c);
        if (!(days > 0) || !c.id) continue;
        const rate = c.montant / days;
        if (rate >= medianRate * 5 || rate <= medianRate * 0.2) {
          issues.push({
            contractId: c.id,
            issueType: 'Amount/Duration Discrepancy',
            severity: 'Medium',
            explanation: `Amount/day (${rate.toFixed(2)}) is an outlier compared with median (${medianRate.toFixed(2)}).`,
          });
        }
      }
    }

    // TERMINE overlaps significantly with ACTIF for same client.
    const byClient = this.groupBy(contracts, (c) => c.clientId);
    for (const list of byClient.values()) {
      const finished = list.filter((c) => (c.statut ?? '').toUpperCase() === 'TERMINE');
      const active = list.filter((c) => (c.statut ?? '').toUpperCase() === 'ACTIF');
      for (const f of finished) {
        for (const a of active) {
          const overlapDays = this.overlapDays(f, a);
          const fDays = Math.max(durationInDays(f), 1);
          if (overlapDays >= fDays * 0.5) {
            if (f.id) {
              issues.push({
                contractId: f.id,
                issueType: 'Status/Timeline Contradiction',
                severity: 'High',
                explanation: `TERMINE contract overlaps significantly (${overlapDays.toFixed(1)} days) with ACTIF contract #${a.id} for same client.`,
              });
            }
          }
        }
      }
    }

    // Entity naming consistency.
    for (const [id, name] of userNameById.entries()) {
      const normalized = name.trim().toLowerCase();
      const variants = Array.from(userNameById.entries())
        .filter(([otherId, otherName]) => otherId !== id && otherName.trim().toLowerCase() === normalized && otherName !== name)
        .map(([otherId, otherName]) => `${otherName} (#${otherId})`);
      if (variants.length > 0) {
        const involved = contracts.filter((c) => c.clientId === id || c.freelancerId === id);
        for (const c of involved) {
          if (!c.id) continue;
          issues.push({
            contractId: c.id,
            issueType: 'Name Consistency',
            severity: 'Low',
            explanation: `User naming variant detected: "${name}" also appears as ${variants.join(', ')}.`,
          });
        }
      }
    }

    return this.deduplicateIssues(issues);
  }

  private buildAuditSummary(issues: FraudIssue[]): string {
    if (issues.length === 0) {
      return 'No major fraud indicators detected. Continue routine monitoring.';
    }
    const high = issues.filter((i) => i.severity === 'High').map((i) => i.contractId);
    const medium = issues.filter((i) => i.severity === 'Medium').map((i) => i.contractId);
    const uniq = (arr: number[]) => Array.from(new Set(arr));
    const highIds = uniq(high);
    const mediumIds = uniq(medium);

    if (highIds.length > 0) {
      return `Immediate manual audit recommended for contracts: ${highIds.join(', ')}. Medium-priority review: ${mediumIds.join(', ') || 'none'}.`;
    }
    return `No high-severity findings. Manual review recommended for medium-risk contracts: ${mediumIds.join(', ') || 'none'}.`;
  }

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private isRoundAmount(amount: number): boolean {
    if (!Number.isFinite(amount)) return false;
    const isInteger = Math.abs(amount - Math.round(amount)) < 1e-9;
    if (!isInteger) return false;
    return amount % 100 === 0 || amount % 50 === 0;
  }

  private groupBy<T, K>(list: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of list) {
      const key = keyFn(item);
      const arr = map.get(key);
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }
    return map;
  }

  private median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
    return sorted[mid];
  }

  private overlapDays(a: Contrat, b: Contrat): number {
    const aStart = this.parseDate(a.dateDebut);
    const aEnd = this.parseDate(a.dateFin);
    const bStart = this.parseDate(b.dateDebut);
    const bEnd = this.parseDate(b.dateFin);
    if (!aStart || !aEnd || !bStart || !bEnd) return 0;
    const start = Math.max(aStart.getTime(), bStart.getTime());
    const end = Math.min(aEnd.getTime(), bEnd.getTime());
    if (end <= start) return 0;
    return (end - start) / (24 * 60 * 60 * 1000);
  }

  private buildUserNameMap(users: any[]): Map<number, string> {
    const map = new Map<number, string>();
    for (const user of users ?? []) {
      const id = Number(user?.id);
      if (!Number.isFinite(id) || id <= 0) continue;
      const username = String(user?.username ?? '').trim();
      const nom = String(user?.nom ?? '').trim();
      const prenom = String(user?.prenom ?? user?.firstName ?? '').trim();
      const full = `${prenom} ${nom}`.trim();
      const display = full || username || `User #${id}`;
      map.set(id, display);
    }
    return map;
  }

  private deduplicateIssues(issues: FraudIssue[]): FraudIssue[] {
    const seen = new Set<string>();
    const dedup: FraudIssue[] = [];
    for (const issue of issues) {
      const key = `${issue.contractId}|${issue.issueType}|${issue.explanation}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(issue);
    }
    return dedup.sort((a, b) => {
      const sevOrder: Record<FraudSeverity, number> = { High: 0, Medium: 1, Low: 2 };
      if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
      return a.contractId - b.contractId;
    });
  }
}
