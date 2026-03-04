import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormationService } from '../../../services/formation.service';
import { Formation } from '../../../models/formation.model';
import { Participant } from '../../../models/participant.model';
import { GlobalStatistics, FormationStatistics, MonthlyRegistration } from '../../../models/statistics.model';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { RegistrationDialogComponent } from '../registration-dialog/registration-dialog.component';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.css']
})
export class FormationDetailComponent implements OnInit {

  formation: Formation | null = null;
  loading = true;
  error = '';

  participants: Participant[] = [];
  showParticipants = false;

  globalStats: GlobalStatistics | null = null;
  formationStats: FormationStatistics | null = null;
  monthlyRegistrations: MonthlyRegistration[] = [];
  showStats = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private meta: Meta,
    private title: Title,
    private dialog: MatDialog,
    private confirmService: ConfirmService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.formationService.getFormationById(id).subscribe({
        next: (data) => {
          this.formation = data;
          this.loading = false;
          this.setMetaTags();
        },
        error: () => {
          this.error = 'Erreur lors du chargement de la formation.';
          this.loading = false;
        }
      });
    }
  }

  private setMetaTags(): void {
    if (!this.formation) return;
    this.title.setTitle(this.formation.title);
    this.meta.updateTag({ property: 'og:title', content: this.formation.title });
    this.meta.updateTag({ property: 'og:description', content: this.formation.description || 'Découvrez cette formation.' });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    if (isPlatformBrowser(this.platformId)) {
      this.meta.updateTag({ property: 'og:url', content: window.location.href });
    }
  }

  goBack(): void { this.router.navigate(['/formations']); }

  edit(): void {
    if (this.formation) this.router.navigate(['/formations', this.formation.id, 'edit']);
  }

  delete(): void {
    if (!this.formation) return;
    this.confirmService.delete(this.formation.title || `Formation #${this.formation.id}`).subscribe(confirmed => {
      if (confirmed) {
        this.formationService.deleteFormation(this.formation!.id).subscribe({
          next: () => this.router.navigate(['/formations']),
          error: () => alert('Erreur lors de la suppression')
        });
      }
    });
  }

  viewCourses(): void {
    if (this.formation) this.router.navigate(['/formations', this.formation.id, 'courses']);
  }

  addCourse(): void {
    if (this.formation) this.router.navigate(['/formations', this.formation.id, 'courses', 'new']);
  }

  viewTests(): void {
    if (this.formation) this.router.navigate(['/formations', this.formation.id, 'tests']);
  }

  addTest(): void {
    if (this.formation) this.router.navigate(['/tests/new'], { queryParams: { formationId: this.formation.id } });
  }

  viewRewards(): void {
    if (this.formation) this.router.navigate(['/formations', this.formation.id, 'rewards']);
  }

  addReward(): void {
    if (this.formation) this.router.navigate(['/rewards/new'], { queryParams: { formationId: this.formation.id } });
  }

  shareOnFacebook(): void {
    const backendShareUrl = `https://abcd1234.ngrok.io/share/formation/${this.formation?.id}`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(backendShareUrl)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
  }

  loadParticipants(): void {
    if (!this.formation) return;
    this.formationService.getParticipantsByFormation(this.formation.id).subscribe({
      next: (data) => { this.participants = data; this.showParticipants = true; },
      error: () => alert('Erreur chargement participants')
    });
  }

  openRegistrationDialog(): void {
    if (!this.formation) return;
    const ref = this.dialog.open(RegistrationDialogComponent, {
      width: '480px',
      data: { formationId: this.formation.id }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadParticipants();
    });
  }

  cancelParticipant(participantId: number): void {
    if (!this.formation) return;
    if (confirm('Annuler la participation ?')) {
      this.formationService.cancelParticipant(this.formation.id, participantId).subscribe({
        next: () => this.loadParticipants(),
        error: () => alert('Erreur annulation')
      });
    }
  }

  loadStatistics(): void {
    if (!this.formation) return;
    this.showStats = true;
    this.formationService.getGlobalStatistics().subscribe(data => this.globalStats = data);
    this.formationService.getFormationStatistics(this.formation.id).subscribe(data => this.formationStats = data);
    this.formationService.getMonthlyRegistrations().subscribe(data => this.monthlyRegistrations = data);
  }
}