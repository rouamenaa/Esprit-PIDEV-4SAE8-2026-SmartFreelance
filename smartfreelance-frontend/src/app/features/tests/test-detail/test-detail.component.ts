import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
import { Test } from '../../../models/test.model';
import { TestService } from '../../../services/test.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-test-detail',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
=======
  imports: [CommonModule],
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.css']
})
export class TestDetailComponent implements OnInit, OnDestroy {

  test: Test | null = null;
  loading = false;
  error = '';
  isSubmitting = false;
  isPolling = false;
  private pollInterval: any = null;

  selectedAnswers: { [questionId: number]: number } = {};
  result: any = null;

  // Certificate fields (manuel)
  userName = '';
  showNameInput = false;
  certificateImageUrl: string | null = null;
  isGeneratingCertificate = false;

  constructor(
    private service: TestService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (id) this.loadTest(id);
  }

  loadTest(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => {
        this.test = data;
        this.loading = false;
        if (!data.questions || data.questions.length === 0) {
          this.startPolling(id);
        } else {
          this.stopPolling();
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error loading test.';
        this.loading = false;
      }
    });
  }

  private startPolling(testId: number): void {
    if (this.pollInterval) return;
    this.isPolling = true;
    this.pollInterval = setInterval(() => {
      this.service.getById(testId).subscribe({
        next: (data) => {
          this.test = data;
          if (data.questions && data.questions.length > 0) {
            this.stopPolling();
          }
        },
        error: () => {}
      });
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  selectAnswer(questionId: number, answerId: number): void {
    if (this.result) return;
    this.selectedAnswers[questionId] = answerId;
  }

  allAnswered(): boolean {
    if (!this.test?.questions) return false;
    return this.test.questions.every(q => this.selectedAnswers[q.id!] !== undefined);
  }

  getScorePercentage(): number {
    if (!this.result) return 0;
    return Math.round((this.result.score / this.result.totalPoints) * 100);
  }

  answeredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  private getUserIdFromStorage(): number | null {
    const userId = localStorage.getItem('userId');
    if (userId) return parseInt(userId, 10);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch { return null; }
    }
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || null;
      } catch { return null; }
    }
    return null;
  }

  submitTest(): void {
    if (!this.test?.id || this.isSubmitting) return;
    this.isSubmitting = true;
    this.error = '';

    const userId = this.getUserIdFromStorage();
    if (userId) {
      // Utilisateur connecté : on envoie l'userId
      const payload = {
        answers: this.selectedAnswers,
        userId: userId
      };
      this.service.submitAttempt(this.test.id, payload).subscribe({
        next: (res) => {
          this.result = res;
          this.isSubmitting = false;
          if (res.passed && res.userName) {
            this.generateCertificateWithName(res.userName);
          } else if (res.passed) {
            this.showNameInput = true;
          }
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error submitting test. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Utilisateur non connecté : on soumet d'abord sans userId, puis on demande le nom
      // Il faut d'abord soumettre les réponses sans userId (ou avec userId null)
      // Mais le backend attend un userId. Pour simplifier, on va d'abord soumettre, puis si réussi, on demande le nom.
      // Ici, je suppose qu'on peut soumettre sans userId (backend modifié pour accepter null)
      // Si ton backend nécessite userId, il faudra le modifier ou passer un userId par défaut.
      // Pour l'exemple, on va envoyer userId = 0 (non connecté) et le backend ne cherchera pas le nom.
      const payload = {
        answers: this.selectedAnswers,
        userId: 0  // utilisateur anonyme
      };
      this.service.submitAttempt(this.test.id, payload).subscribe({
        next: (res) => {
          this.result = res;
          this.isSubmitting = false;
          if (res.passed) {
            this.showNameInput = true;
          }
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error submitting test. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  generateCertificate(): void {
    if (!this.userName.trim() || !this.test) return;
    this.isGeneratingCertificate = true;

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#f0fff4');
      grad.addColorStop(0.5, '#e6ffed');
      grad.addColorStop(1, '#c6f6d5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#38a169';
      ctx.lineWidth = 10;
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      ctx.strokeStyle = '#9ae6b4';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.font = '60px Arial';
      ctx.fillText('🏆', canvas.width / 2 - 35, 110);

      ctx.font = 'bold 36px "Segoe UI", Arial';
      ctx.fillStyle = '#1a1d2e';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Achievement', canvas.width / 2, 165);

      ctx.font = '20px "Segoe UI", Arial';
      ctx.fillStyle = '#4a4f68';
      ctx.fillText('This certificate is proudly presented to', canvas.width / 2, 210);

      ctx.font = 'bold 52px "Segoe UI", Arial';
      ctx.fillStyle = '#2f855a';
      ctx.fillText(this.userName, canvas.width / 2, 280);

      const nameWidth = ctx.measureText(this.userName).width;
      ctx.strokeStyle = '#38a169';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2, 295);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2, 295);
      ctx.stroke();

      ctx.font = '22px "Segoe UI", Arial';
      ctx.fillStyle = '#4a4f68';
      ctx.fillText(`for successfully completing the test`, canvas.width / 2, 340);

      ctx.font = 'bold 24px "Segoe UI", Arial';
      ctx.fillStyle = '#2d3748';
      ctx.fillText(`"${this.test!.title}"`, canvas.width / 2, 375);

      ctx.font = '18px "Segoe UI", Arial';
      ctx.fillStyle = '#38a169';
      ctx.fillText(`Score: ${this.result.score} / ${this.result.totalPoints} pts (${this.getScorePercentage()}%)`, canvas.width / 2, 415);

      ctx.font = '16px "Segoe UI", Arial';
      ctx.fillStyle = '#8a90b0';
      ctx.textAlign = 'right';
      ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width - 50, 460);

      this.certificateImageUrl = canvas.toDataURL('image/png');
      this.isGeneratingCertificate = false;
      this.showNameInput = false;
    }, 500);
  }

  generateCertificateWithName(userName: string): void {
    this.userName = userName;
    this.generateCertificate();
  }

  downloadCertificate(): void {
    if (this.certificateImageUrl) {
      const link = document.createElement('a');
      link.href = this.certificateImageUrl;
      link.download = `certificate_${new Date().getTime()}.png`;
      link.click();
    }
  }

  goBack(): void {
    const formationId = this.test?.formation?.id;
    if (formationId) {
      this.router.navigate(['/formations', formationId, 'tests']);
    } else {
      this.router.navigate(['/tests']);
    }
  }

  edit(): void {
    this.router.navigate(['/tests', this.test?.id, 'edit']);
  }

  delete(): void {
    if (!this.test) return;
    this.confirmService.delete(this.test.title || `Test #${this.test.id}`).subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(this.test!.id!).subscribe({
          next: () => this.goBack(),
          error: (err) => console.error(err)
        });
      }
    });
  }
}