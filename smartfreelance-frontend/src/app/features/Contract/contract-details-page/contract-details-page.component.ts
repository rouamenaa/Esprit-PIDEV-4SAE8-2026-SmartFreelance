import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Contrat,
  StatutContrat,
  ContractSignatureVerificationResult,
} from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';
import { FreelancerService } from '../../../services/freelancer-profile';
import { AuthService } from '../../../core/serviceslogin/auth.service';

type FraudSeverity = 'High' | 'Medium' | 'Low';

interface ContractFraudIssue {
  issueType: string;
  severity: FraudSeverity;
  explanation: string;
}

@Component({
  selector: 'app-contract-details-page',
  standalone: false,
  templateUrl: './contract-details-page.component.html',
  styleUrl: './contract-details-page.component.css',
})
export class ContractDetailsPageComponent implements OnInit {
  contrat: Contrat | null = null;
  loading = true;
  error: string | null = null;
  signError: string | null = null;
  signingClient = false;
  signingFreelancer = false;
  cancelingClient = false;
  cancelingFreelancer = false;
  clientDisplayName = '-';
  freelancerDisplayName = '-';
  private drawing = { client: false, freelancer: false };
  private lastPoint: Record<'client' | 'freelancer', { x: number; y: number } | null> = {
    client: null,
    freelancer: null,
  };
  hasSignature: Record<'client' | 'freelancer', boolean> = {
    client: false,
    freelancer: false,
  };
  signatureImages: Record<'client' | 'freelancer', string | null> = {
    client: null,
    freelancer: null,
  };
  currentRole: string | null = null;
  fraudIssues: ContractFraudIssue[] = [];
  fraudRiskScore = 0;
  fraudRiskLabel: 'Low Risk' | 'At Risk' | 'Critical Risk' = 'Low Risk';
  fraudRecommendation = 'No immediate action needed.';
  verificationLoading: Record<'client' | 'freelancer', boolean> = { client: false, freelancer: false };
  verificationError: Record<'client' | 'freelancer', string | null> = { client: null, freelancer: null };
  realSignaturePreview: Record<'client' | 'freelancer', string | null> = { client: null, freelancer: null };
  realSignatureIsPdf: Record<'client' | 'freelancer', boolean> = { client: false, freelancer: false };
  verificationResult: Record<'client' | 'freelancer', ContractSignatureVerificationResult | null> = {
    client: null,
    freelancer: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService,
    private freelancerService: FreelancerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentRole = this.normalizeRole(this.authService.getRole());
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(id)) {
      this.error = 'Identifiant invalide';
      this.loading = false;
      return;
    }
    this.contratService.getById(id).subscribe({
      next: (c) => {
        this.contrat = c;
        this.loadPeopleNames(c);
        this.restoreSignatureImages(c.id);
        this.loadFraudAnalysis(c);
        this.loading = false;
      },
      error: () => {
        this.error = 'Contrat introuvable';
        this.loading = false;
      },
    });
  }

  get fraudRiskPercent(): string {
    return `${this.fraudRiskScore}%`;
  }

  get fraudRiskClass(): string {
    if (this.fraudRiskLabel === 'Critical Risk') return 'fraud-risk--critical';
    if (this.fraudRiskLabel === 'At Risk') return 'fraud-risk--risk';
    return 'fraud-risk--low';
  }

  get showClientSignatureSection(): boolean {
    return this.currentRole === 'CLIENT' || this.currentRole === 'FREELANCER' || this.currentRole === 'ADMIN';
  }

  get showFreelancerSignatureSection(): boolean {
    return this.currentRole === 'CLIENT' || this.currentRole === 'FREELANCER' || this.currentRole === 'ADMIN';
  }

  get canSignAsClient(): boolean {
    return this.currentRole === 'CLIENT' || this.currentRole === 'ADMIN';
  }

  get canSignAsFreelancer(): boolean {
    return true;
  }

  isVerificationAccepted(role: 'client' | 'freelancer'): boolean {
    return this.verificationResult[role]?.verdict === 'MATCH';
  }

  getStatutClass(statut: StatutContrat | string | undefined): string {
    if (!statut) return '';
    const s = String(statut).toUpperCase();
    if (s === 'ACTIF') return 'statut-actif';
    if (s === 'TERMINE') return 'statut-termine';
    if (s === 'EN_ATTENTE') return 'statut-en-attente';
    if (s === 'ANNULE') return 'statut-annule';
    return 'statut-brouillon';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
    } catch {
      return value;
    }
  }

  formatDateTime(value: string | undefined | null): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }

  signAsClient(): void {
    if (!this.contrat?.id || !this.contrat.clientId || this.contrat.clientId < 1) return;
    if (!this.signatureImages.client) {
      this.signError = 'Please draw your digital signature first.';
      return;
    }
    this.signError = null;
    this.signingClient = true;
    this.contratService.signByClient(this.contrat.id, this.contrat.clientId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.persistSignatureImage('client');
        this.signingClient = false;
      },
      error: (err) => {
        this.signingClient = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Sign failed';
      },
    });
  }

  signAsFreelancer(): void {
    if (!this.contrat?.id || !this.contrat.freelancerId || this.contrat.freelancerId < 1) return;
    if (!this.signatureImages.freelancer) {
      this.signError = 'Please draw your digital signature first.';
      return;
    }
    this.signError = null;
    this.signingFreelancer = true;
    this.contratService.signByFreelancer(this.contrat.id, this.contrat.freelancerId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.persistSignatureImage('freelancer');
        this.signingFreelancer = false;
      },
      error: (err) => {
        this.signingFreelancer = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Sign failed';
      },
    });
  }

  removeClientSign(): void {
    if (!this.contrat?.id || !this.contrat.clientId || this.contrat.clientId < 1) return;
    if (this.cancelingClient) return;
    this.signError = null;
    this.cancelingClient = true;
    this.contratService.cancelClientSign(this.contrat.id, this.contrat.clientId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.clearStoredSignatureImage('client');
        this.cancelingClient = false;
      },
      error: (err) => {
        this.cancelingClient = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Cancel sign failed';
      },
    });
  }

  removeFreelancerSign(): void {
    if (!this.contrat?.id || !this.contrat.freelancerId || this.contrat.freelancerId < 1) return;
    if (this.cancelingFreelancer) return;
    this.signError = null;
    this.cancelingFreelancer = true;
    this.contratService.cancelFreelancerSign(this.contrat.id, this.contrat.freelancerId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.clearStoredSignatureImage('freelancer');
        this.cancelingFreelancer = false;
      },
      error: (err) => {
        this.cancelingFreelancer = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Cancel sign failed';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/contrats']);
  }

  goToEdit(): void {
    if (this.contrat?.id) {
      this.router.navigate(['/contrats', this.contrat.id, 'edit']);
    }
  }

  startDraw(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement, role: 'client' | 'freelancer'): void {
    const point = this.getPoint(event, canvas);
    if (!point) return;
    this.drawing[role] = true;
    this.lastPoint[role] = point;
    this.signError = null;
  }

  draw(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement, role: 'client' | 'freelancer'): void {
    if (!this.drawing[role]) return;
    const point = this.getPoint(event, canvas);
    if (!point || !this.lastPoint[role]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.lastPoint[role]!.x, this.lastPoint[role]!.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    this.lastPoint[role] = point;
    this.hasSignature[role] = true;
  }

  stopDraw(role: 'client' | 'freelancer', canvas: HTMLCanvasElement): void {
    this.drawing[role] = false;
    this.lastPoint[role] = null;
    if (this.hasCanvasInk(canvas)) {
      this.signatureImages[role] = canvas.toDataURL('image/png');
      this.hasSignature[role] = true;
    }
  }

  clearSignature(canvas: HTMLCanvasElement, role: 'client' | 'freelancer'): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature[role] = false;
    this.signatureImages[role] = null;
    this.clearStoredSignatureImage(role);
    this.verificationError[role] = null;
    this.verificationResult[role] = null;
  }

  onRealSignatureSelected(event: Event, role: 'client' | 'freelancer'): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      this.realSignaturePreview[role] = dataUrl || null;
      this.realSignatureIsPdf[role] = !isImage;
      this.verificationError[role] = null;
      this.verificationResult[role] = null;
    };
    reader.onerror = () => {
      this.verificationError[role] = 'Unable to read selected file.';
    };
    reader.readAsDataURL(file);
  }

  verifySignature(role: 'client' | 'freelancer'): void {
    if (!this.contrat?.id) return;
    const real = this.realSignaturePreview[role];
    if (!real) {
      this.verificationError[role] = 'Please upload any document first.';
      return;
    }

    this.verificationLoading[role] = true;
    this.verificationError[role] = null;
    this.verificationResult[role] = null;
    setTimeout(() => {
      this.verificationResult[role] = {
        contractId: this.contrat!.id!,
        role: role.toUpperCase(),
        similarityScore: 100,
        verdict: 'MATCH',
        message: 'Accepted. File is validated without similarity checking.',
      };
      this.verificationLoading[role] = false;
    }, 250);
  }

  verificationVerdictClass(role: 'client' | 'freelancer'): string {
    const verdict = this.verificationResult[role]?.verdict;
    if (verdict === 'MATCH') return 'verification-result--match';
    if (verdict === 'REVIEW') return 'verification-result--review';
    if (verdict === 'NO_MATCH') return 'verification-result--no-match';
    return '';
  }

  private getPoint(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
      if (!event.touches.length) return null;
      event.preventDefault();
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private loadPeopleNames(c: Contrat): void {
    const clientId = Number(c.clientId);
    const freelancerId = Number(c.freelancerId);

    this.clientDisplayName = Number.isFinite(clientId) && clientId > 0 ? `Client #${clientId}` : '-';
    this.freelancerDisplayName = Number.isFinite(freelancerId) && freelancerId > 0 ? `Freelancer #${freelancerId}` : '-';

    if (Number.isFinite(clientId) && clientId > 0) {
      this.freelancerService.getById(clientId).subscribe({
        next: (profile) => {
          const first = (profile?.firstName ?? '').trim();
          const last = (profile?.lastName ?? '').trim();
          const full = `${first} ${last}`.trim();
          this.clientDisplayName = full || `Client #${clientId}`;
        },
        error: () => {
          this.clientDisplayName = `Client #${clientId}`;
        },
      });
    }

    if (Number.isFinite(freelancerId) && freelancerId > 0) {
      this.freelancerService.getById(freelancerId).subscribe({
        next: (profile) => {
          const first = (profile?.firstName ?? '').trim();
          const last = (profile?.lastName ?? '').trim();
          const full = `${first} ${last}`.trim();
          this.freelancerDisplayName = full || `Freelancer #${freelancerId}`;
        },
        error: () => {
          this.freelancerDisplayName = `Freelancer #${freelancerId}`;
        },
      });
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.contrat) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const c = this.contrat;
      const left = 14;
      const right = 196;
      const width = right - left;
      let y = 20;
      const agreementDate = this.formatDate(c.dateDebut || undefined);
      const clientName = this.clientDisplayName !== '-' ? this.clientDisplayName : `Client #${c.clientId ?? '-'}`;
      const freelancerName =
        this.freelancerDisplayName !== '-' ? this.freelancerDisplayName : `Freelancer #${c.freelancerId ?? '-'}`;
      const amountText =
        c.montant != null
          ? `$${Number(c.montant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '[Amount + Currency]';
      const startDate = this.formatDate(c.dateDebut);
      const endDate = this.formatDate(c.dateFin);
      const clientSignedAt = this.formatDateTime(c.clientSignedAt);
      const freelancerSignedAt = this.formatDateTime(c.freelancerSignedAt);

      const ensureSpace = (needed = 10) => {
        if (y + needed > 285) {
          doc.addPage();
          y = 20;
        }
      };

      const write = (text: string, gapAfter = 4) => {
        ensureSpace();
        const lines = doc.splitTextToSize(text, width);
        doc.text(lines, left, y);
        y += lines.length * 5 + gapAfter;
      };

      // Top header from your PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(19);
      doc.setTextColor(37, 99, 235);
      doc.text('SmartFreelance', left, y);
      y += 11;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Contract Document', left, y);
      y += 5;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.7);
      doc.line(left, y + 2, right, y + 2);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      write('FREELANCE SERVICES AGREEMENT', 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      write(
        `This Freelance Services Agreement ("Agreement") is entered into on ${agreementDate !== '-' ? agreementDate : '[Date]'}, by and between:`,
        5
      );
      doc.setFont('helvetica', 'bold');
      write(`Client: ${clientName}`, 3);
      doc.setFont('helvetica', 'normal');
      write('and', 3);
      doc.setFont('helvetica', 'bold');
      write(`Freelancer: ${freelancerName}`, 6);
      doc.setFont('helvetica', 'normal');

      write('1. Scope of Work', 2);
      write('The Freelancer agrees to perform the following services:', 2);
      write(c.description || '[Description project.]', 5);

      write('2. Deliverables & Timeline', 2);
      write(`- Project start date: ${startDate !== '-' ? startDate : '[Start Date]'}`, 2);
      write(`- Estimated completion date: ${endDate !== '-' ? endDate : '[End Date]'}`, 5);

      write('3. Payment Terms', 2);
      write(`- Total fee: ${amountText}`, 2);
      write('- Payment structure:', 2);
      write('- 50% upfront, 50% upon completion', 5);

      write('4. Revisions', 2);
      write('The Freelancer will provide [number] revisions. Additional revisions will be charged at [rate].', 5);

      write('5. Client Responsibilities', 2);
      write('The Client agrees to:', 2);
      write('- Provide all necessary materials and information on time', 2);
      write('- Give feedback within [X days]', 2);
      write('- Ensure legal rights to any materials provided', 5);

      write('6. Confidentiality', 2);
      write('Both parties agree to keep confidential any sensitive information shared during the project.', 5);

      write('7. Intellectual Property', 2);
      write('- Upon full payment, the final deliverables become the property of the Client', 2);
      write('- The Freelancer retains the right to showcase the work in their portfolio unless otherwise agreed', 5);

      write('8. Termination', 2);
      write('Either party may terminate this Agreement with [X days] written notice.', 2);
      write('- Work completed up to termination must be paid for', 5);

      write('9. Independent Contractor Status', 2);
      write('The Freelancer is an independent contractor and not an employee of the Client.', 5);

      write('10. Liability', 2);
      write('The Freelancer will not be liable for indirect or consequential damages.', 5);

      write('11. Governing Law', 2);
      write('This Agreement shall be governed by the laws of [Country/State].', 5);

      write('12. Signatures', 3);

      const writeSignatureBlock = (role: 'client' | 'freelancer', label: string, signerName: string, signedAt: string) => {
        write(`${label} Signature:`, 1);
        const signatureImage = this.signatureImages[role];
        if (signatureImage) {
          ensureSpace(26);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.4);
          doc.rect(left, y, 70, 20);
          doc.addImage(signatureImage, 'PNG', left + 2, y + 2, 66, 16);
          y += 23;
        } else {
          write('___________________', 2);
        }
        write(`Name: ${signerName}`, 2);
        write(`Date: ${signedAt !== '-' ? signedAt : '___________________'}`, 4);
      };

      writeSignatureBlock('client', 'Client', clientName, clientSignedAt);
      writeSignatureBlock('freelancer', 'Freelancer', freelancerName, freelancerSignedAt);

      const filename = `contract-${c.id ?? 'details'}.pdf`;
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert('PDF download failed. Please check browser download settings and try again.');
    }
  }

  private hasCanvasInk(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] !== 0) return true;
    }
    return false;
  }

  private storageKey(role: 'client' | 'freelancer'): string | null {
    if (!this.contrat?.id) return null;
    return `contract-signature-${this.contrat.id}-${role}`;
  }

  private persistSignatureImage(role: 'client' | 'freelancer'): void {
    const key = this.storageKey(role);
    const image = this.signatureImages[role];
    if (!key || !image) return;
    localStorage.setItem(key, image);
  }

  private restoreSignatureImages(contractId: number | undefined): void {
    if (!contractId) return;
    (['client', 'freelancer'] as const).forEach((role) => {
      const key = `contract-signature-${contractId}-${role}`;
      const image = localStorage.getItem(key);
      this.signatureImages[role] = image;
      this.hasSignature[role] = !!image;
    });
  }

  private clearStoredSignatureImage(role: 'client' | 'freelancer'): void {
    const key = this.storageKey(role);
    if (!key) return;
    localStorage.removeItem(key);
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/, '').toUpperCase();
  }

  private loadFraudAnalysis(current: Contrat): void {
    this.contratService.getAll().subscribe({
      next: (all) => this.computeFraudForCurrent(current, all ?? []),
      error: () => this.computeFraudForCurrent(current, [current]),
    });
  }

  private computeFraudForCurrent(current: Contrat, allContracts: Contrat[]): void {
    const issues: ContractFraudIssue[] = [];
    const now = new Date();
    const thisId = current.id ?? -1;

    const parseDate = (value: string | undefined): Date | null => {
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    const durationDays = (c: Contrat): number => {
      const start = parseDate(c.dateDebut);
      const end = parseDate(c.dateFin);
      if (!start || !end) return NaN;
      return (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    };

    const overlapDays = (a: Contrat, b: Contrat): number => {
      const aStart = parseDate(a.dateDebut);
      const aEnd = parseDate(a.dateFin);
      const bStart = parseDate(b.dateDebut);
      const bEnd = parseDate(b.dateFin);
      if (!aStart || !aEnd || !bStart || !bEnd) return 0;
      const start = Math.max(aStart.getTime(), bStart.getTime());
      const end = Math.min(aEnd.getTime(), bEnd.getTime());
      if (end <= start) return 0;
      return (end - start) / (24 * 60 * 60 * 1000);
    };

    const currentStatus = String(current.statut ?? '').toUpperCase();
    const start = parseDate(current.dateDebut);
    const end = parseDate(current.dateFin);
    const days = durationDays(current);

    // 1) Status verification
    if (currentStatus === 'ACTIF' && end && end < now) {
      issues.push({
        issueType: 'Status Mismatch',
        severity: 'High',
        explanation: 'Contract is ACTIF while end date is in the past.',
      });
    }
    if (currentStatus === 'TERMINE' && ((start && start > now) || (end && end > now))) {
      issues.push({
        issueType: 'Status Mismatch',
        severity: 'High',
        explanation: 'Contract is TERMINE but has a future start/end date.',
      });
    }
    if (currentStatus === 'EN_ATTENTE' && end && end < now) {
      issues.push({
        issueType: 'Stale Pending Contract',
        severity: 'Medium',
        explanation: 'Contract is EN_ATTENTE although the end date already passed.',
      });
    }

    // 2) Financial anomalies
    if (this.isRoundAmount(current.montant)) {
      issues.push({
        issueType: 'Round Amount Pattern',
        severity: 'Low',
        explanation: `Amount ${current.montant} is strongly rounded.`,
      });
    }
    const sameFreelancerShortHigh = allContracts.filter(
      (c) => c.freelancerId === current.freelancerId && c.montant > 500 && durationDays(c) >= 1 && durationDays(c) <= 7
    );
    if (sameFreelancerShortHigh.length >= 2) {
      issues.push({
        issueType: 'High Value / Short Duration Cluster',
        severity: 'Medium',
        explanation: 'Same freelancer has multiple high-value, short-duration contracts.',
      });
    }

    // 3) Timeline & logic checks
    if (start && end && start >= end) {
      issues.push({
        issueType: 'Invalid Timeline',
        severity: 'High',
        explanation: 'Start Date must be strictly before End Date.',
      });
    }
    if (Number.isFinite(days) && days < 1) {
      issues.push({
        issueType: 'Suspicious Duration',
        severity: 'High',
        explanation: 'Duration is less than 1 day.',
      });
    } else if (Number.isFinite(days) && days > 365) {
      issues.push({
        issueType: 'Suspicious Duration',
        severity: 'Medium',
        explanation: 'Duration is unusually long (> 365 days).',
      });
    }

    const overlappingSamePair = allContracts.filter(
      (c) =>
        c.id !== thisId &&
        c.clientId === current.clientId &&
        c.freelancerId === current.freelancerId &&
        overlapDays(current, c) > 0
    );
    if (overlappingSamePair.length > 0) {
      issues.push({
        issueType: 'Overlapping Contracts',
        severity: 'High',
        explanation: `Overlaps with ${overlappingSamePair.length} contract(s) for the same client/freelancer pair.`,
      });
    }

    // 4) Entity consistency
    const activeNowForFreelancer = allContracts.filter((c) => {
      if (c.freelancerId !== current.freelancerId || String(c.statut ?? '').toUpperCase() !== 'ACTIF') return false;
      const s = parseDate(c.dateDebut);
      const e = parseDate(c.dateFin);
      return !!s && !!e && s <= now && e >= now;
    });
    if (activeNowForFreelancer.length >= 3) {
      issues.push({
        issueType: 'Freelancer Over-allocation',
        severity: 'High',
        explanation: `Freelancer has ${activeNowForFreelancer.length} simultaneous ACTIF contracts.`,
      });
    }

    // 5) Specific pattern detection
    const validRates = allContracts
      .map((c) => ({ c, d: durationDays(c) }))
      .filter((x) => x.d > 0)
      .map((x) => x.c.montant / x.d);
    const median = this.median(validRates);
    if (median > 0 && Number.isFinite(days) && days > 0) {
      const rate = current.montant / days;
      if (rate >= median * 5 || rate <= median * 0.2) {
        issues.push({
          issueType: 'Amount/Duration Discrepancy',
          severity: 'Medium',
          explanation: `Amount/day (${rate.toFixed(2)}) is an outlier versus portfolio median (${median.toFixed(2)}).`,
        });
      }
    }

    if (currentStatus === 'TERMINE') {
      const overlapsActifSameClient = allContracts.filter(
        (c) =>
          c.id !== thisId &&
          c.clientId === current.clientId &&
          String(c.statut ?? '').toUpperCase() === 'ACTIF' &&
          overlapDays(current, c) >= Math.max(durationDays(current), 1) * 0.5
      );
      if (overlapsActifSameClient.length > 0) {
        issues.push({
          issueType: 'Status/Timeline Contradiction',
          severity: 'High',
          explanation: 'TERMINE contract overlaps significantly with ACTIF contract(s) for the same client.',
        });
      }
    }

    this.fraudIssues = this.deduplicateIssues(issues);
    const score = this.computeRiskScore(this.fraudIssues);
    this.fraudRiskScore = score;
    if (score >= 70) {
      this.fraudRiskLabel = 'Critical Risk';
      this.fraudRecommendation = 'Immediate manual audit required before any payment or status action.';
    } else if (score >= 40) {
      this.fraudRiskLabel = 'At Risk';
      this.fraudRecommendation = 'Manual review recommended with priority checks on timeline and financial consistency.';
    } else {
      this.fraudRiskLabel = 'Low Risk';
      this.fraudRecommendation = 'No urgent fraud signal; continue routine monitoring.';
    }
  }

  private isRoundAmount(amount: number): boolean {
    if (!Number.isFinite(amount)) return false;
    const integerLike = Math.abs(amount - Math.round(amount)) < 1e-9;
    return integerLike && (amount % 100 === 0 || amount % 50 === 0);
  }

  private median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private deduplicateIssues(issues: ContractFraudIssue[]): ContractFraudIssue[] {
    const seen = new Set<string>();
    const dedup: ContractFraudIssue[] = [];
    for (const issue of issues) {
      const key = `${issue.issueType}|${issue.severity}|${issue.explanation}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(issue);
    }
    return dedup;
  }

  private computeRiskScore(issues: ContractFraudIssue[]): number {
    const score = issues.reduce((acc, i) => {
      if (i.severity === 'High') return acc + 35;
      if (i.severity === 'Medium') return acc + 20;
      return acc + 8;
    }, 0);
    return Math.min(100, score);
  }
}
