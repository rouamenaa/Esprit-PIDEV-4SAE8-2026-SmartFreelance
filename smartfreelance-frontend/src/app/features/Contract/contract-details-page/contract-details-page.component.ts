import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contrat, StatutContrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';
import { FreelancerService } from '../../../services/freelancer-profile';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService,
    private freelancerService: FreelancerService
  ) {}

  ngOnInit(): void {
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
        this.loading = false;
      },
      error: () => {
        this.error = 'Contrat introuvable';
        this.loading = false;
      },
    });
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
    if (!this.hasSignature.client) {
      this.signError = 'Please draw your digital signature first.';
      return;
    }
    this.signError = null;
    this.signingClient = true;
    this.contratService.signByClient(this.contrat.id, this.contrat.clientId).subscribe({
      next: (c) => {
        this.contrat = c;
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
    if (!this.hasSignature.freelancer) {
      this.signError = 'Please draw your digital signature first.';
      return;
    }
    this.signError = null;
    this.signingFreelancer = true;
    this.contratService.signByFreelancer(this.contrat.id, this.contrat.freelancerId).subscribe({
      next: (c) => {
        this.contrat = c;
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

  stopDraw(role: 'client' | 'freelancer'): void {
    this.drawing[role] = false;
    this.lastPoint[role] = null;
  }

  clearSignature(canvas: HTMLCanvasElement, role: 'client' | 'freelancer'): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature[role] = false;
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
      const clientName = `Client #${c.clientId ?? '-'}`;
      const freelancerName = `Freelancer #${c.freelancerId ?? '-'}`;
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

      write('12. Signatures', 2);
      write('Client Signature: ___________________', 2);
      write(`Name: ${clientName}`, 2);
      write(`Date: ${clientSignedAt !== '-' ? clientSignedAt : '___________________'}`, 4);
      write('Freelancer Signature: ___________________', 2);
      write(`Name: ${freelancerName}`, 2);
      write(`Date: ${freelancerSignedAt !== '-' ? freelancerSignedAt : '___________________'}`, 6);

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
}
