import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import * as faceapi from 'face-api.js';
import { AfterViewInit } from '@angular/core';

declare var grecaptcha: any;


@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit, AfterViewInit {
  // Disable external AI verification calls (no API key needed).

  user: any = { id: null, email: '', name: '', password: '', role: '' };
  users: any[] = [];
  isEditMode: boolean = false;
  emailError: string = '';
  nameError: string = '';
  passwordError: string = '';
  roleError: string = '';
  submitError: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  hoveredIndex: number | null = null;
  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  faceDescriptor: Float32Array | null = null;
  recaptchaWidgetId: any;


  selectedFile: File | null = null;
  selectedFileName: string = '';
  isVerifying: boolean = false;
  verificationResult: { valid: boolean; message: string; name?: string } | null = null;

  // ✅ Nouveau — afficher l'écran "check your email"
  registrationDone: boolean = false;
  registeredEmail: string = '';

  private registerUrl = 'http://localhost:8085/auth/register';
  private usersUrl = 'http://localhost:8085/auth/all';
  private usersUrl1 = 'http://localhost:8085/auth/user';


  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.user.role = params['role'];
      }
    });

    await this.loadFaceModels();

    this.loadUsers();
  }

  // ✅ CORRECT PLACE
  ngAfterViewInit(): void {
    setTimeout(() => {
      if ((window as any).grecaptcha) {
        this.renderCaptcha();
      }
    }, 500);

    this.startCamera(); // 👈 important
  }

  async loadFaceModels() {
    const MODEL_URL = '/models';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    console.log('✅ Face models loaded');
  }

  async startCamera() {
    this.video = document.getElementById('video') as HTMLVideoElement;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;

    await this.video.play();
  }

  async captureFace() {
    const detection = await faceapi
      .detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert('❌ No face detected');
      return;
    }

    this.faceDescriptor = detection.descriptor;
    console.log('✅ Face captured');
  }

  goHome() { this.router.navigate(['/home']); }
  // =======
  //   private registerUrl = 'http://localhost:8085/auth/register';
  //   private usersUrl = 'http://localhost:8085/auth/all';
  //   private usersUrl1 = 'http://localhost:8085/auth/user';

  //   constructor(private http: HttpClient, private router: Router) {}

  //   ngOnInit() {
  //     this.loadUsers();
  //   } 

  //   goHome() {
  //     this.router.navigate(['/home']);
  //   }
  // >>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadUsers() {
    this.http.get<any[]>(this.usersUrl, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Erreur chargement:', err)
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  validateEmail(): boolean {
    if (!this.user.email) { this.emailError = 'Email is required'; return false; }
    if (!this.isValidEmail(this.user.email)) { this.emailError = 'Invalid email format'; return false; }
    // =======
    //     if (!this.user.email) { this.emailError = 'Email est obligatoire'; return false; }
    //     if (!this.isValidEmail(this.user.email)) { this.emailError = 'Format email invalide (ex: nom@domaine.com)'; return false; }
    // >>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    this.emailError = '';
    return true;
  }

  validateName(): boolean {
    if (!this.user.name) { this.nameError = 'Name is required'; return false; }
    if (this.user.name.length < 3) { this.nameError = 'Minimum 3 characters'; return false; }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(this.user.name)) { this.nameError = 'Letters only'; return false; }

    this.nameError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.user.password) { this.passwordError = 'Password is required'; return false; }
    if (this.user.password.length < 6) { this.passwordError = 'Minimum 6 characters'; return false; }

    this.passwordError = '';
    return true;
  }

  validateRole(): boolean {
    if (!this.user.role) { this.roleError = 'Please select a role'; return false; }

    this.roleError = '';
    return true;
  }


  addUser() {
    this.submitError = '';

    if (!this.validateEmail()) return;
    if (!this.validateName()) return;
    if (!this.validatePassword()) return;
    if (!this.validateRole()) return;

    if (!this.faceDescriptor) {
      alert("❌ Capture face first");
      return;
    }

    // ✅ GET CAPTCHA TOKEN (v2)
    const captchaToken = (window as any).grecaptcha.getResponse(this.recaptchaWidgetId); if (!captchaToken) {
      alert("⚠️ Please check the captcha");
      return;
    }

    this.isLoading = true;

    const payload = {
      username: this.user.name,
      email: this.user.email,
      password: this.user.password,
      faceDescriptor: JSON.stringify(this.faceDescriptor),
      captchaToken: captchaToken
    };

    this.http.post(this.registerUrl, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.registeredEmail = this.user.email;
        this.registrationDone = true;

        // 🔥 RESET CAPTCHA
        (window as any).grecaptcha.reset();
      },
      error: (err) => {
        this.isLoading = false;

        console.log("ERROR BACKEND:", err.error);

        if (err.status === 409) this.emailError = 'This email already exists';
        else this.submitError = err.error?.message || 'Registration failed ❌';
      }
    });
  }

  renderCaptcha() {
    const container = document.getElementById('recaptcha-container');

    if (!container) {
      console.error("❌ recaptcha container NOT FOUND");
      return;
    }

    if ((window as any).grecaptcha) {
      this.recaptchaWidgetId = (window as any).grecaptcha.render(container, {
        sitekey: ''
      });
    } else {
      console.error("❌ reCAPTCHA not loaded");
    }
  }

  editUser(user: any) {
    this.user = { ...user, name: user.username };
    this.isEditMode = true;
    this.emailError = '';
    this.nameError = '';
    this.passwordError = '';
    this.roleError = '';
    this.successMessage = '';
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {

      this.http.delete(`${this.usersUrl1}/${id}`, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  resetForm() {
    this.user = { id: null, email: '', name: '', password: '', role: '' };
    this.isEditMode = false;
    this.emailError = '';
    this.nameError = '';
    this.passwordError = '';
    this.roleError = '';
    this.successMessage = '';
    this.submitError = '';
    this.verificationResult = null;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.registrationDone = false;
    this.registeredEmail = '';
  }

  private toFriendlyError(err: any, action: 'register' | 'update'): string {
    const raw = (typeof err?.error === 'string'
      ? err.error
      : (err?.error?.message || err?.message || '')
    ).toLowerCase();

    if (raw.includes('email already exists')) {
      return 'Cet email existe deja.';
    }
    if (raw.includes('nom') || raw.includes('not-null property references a null or transient value')) {
      return 'Le nom est obligatoire. Verifiez le champ Full name puis reessayez.';
    }
    if (raw.includes('forbidden') || err?.status === 403) {
      return action === 'register'
        ? "Creation refusee par le serveur. Verifiez le role choisi."
        : "Modification refusee par le serveur.";
    }

    return `Echec de ${action === 'register' ? "l'ajout" : 'la modification'} utilisateur (HTTP ${err?.status ?? 'N/A'}).`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.verificationResult = null;
    } else {
      alert('Please select a PDF file only.');

    }
  }

  async verifyDocument() {
    if (!this.selectedFile) return;

    this.isVerifying = true;
    this.verificationResult = null;

    try {
      const apiKey = '';

      const text = await this.fileToText(this.selectedFile);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Here is the content of a document (CV or diploma):

  ${text}

  Reply ONLY in JSON without markdown:
  {
    "valid": true or false,
    "name": "First Last detected or null",
    "message": "Short explanation in English"
  }
  Criteria:
  - valid = true if a readable full name is clearly present
  - valid = false if empty or no name
  - name = the full name detected (or null)
  - message = explanation in 1 sentence`

          }]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const clean = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);

      this.verificationResult = {
        valid: result.valid,
        message: result.message,
        name: result.name
      };

    } catch (error) {
      this.verificationResult = {
        valid: false,
        message: 'Error: ' + (error as any).message

      };
    } finally {
      this.isVerifying = false;
    }
  }

  private async fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
