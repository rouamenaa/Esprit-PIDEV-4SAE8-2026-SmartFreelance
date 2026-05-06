import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit {
  user: any = { id: null, email: '', name: '', password: '', role: '' };
  users: any[] = [];
  isEditMode: boolean = false;
  emailError: string = '';
  nameError: string = '';
  passwordError: string = '';
  roleError: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  selectedFile: File | null = null;
  selectedFileName: string = '';
  isVerifying: boolean = false;
  verificationResult: { valid: boolean; message: string; name?: string } | null = null;

  private registerUrl = 'http://localhost:8085/auth/register';
  private usersUrl = 'http://localhost:8085/auth/all';
  private usersUrl1 = 'http://localhost:8085/auth/user';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

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
    if (!this.user.email) { this.emailError = 'Email est obligatoire'; return false; }
    if (!this.isValidEmail(this.user.email)) { this.emailError = 'Format email invalide (ex: nom@domaine.com)'; return false; }
    this.emailError = '';
    return true;
  }

  validateName(): boolean {
    if (!this.user.name) { this.nameError = 'Nom est obligatoire'; return false; }
    if (this.user.name.length < 3) { this.nameError = 'Minimum 3 caractères'; return false; }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(this.user.name)) { this.nameError = 'Lettres uniquement'; return false; }
    this.nameError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.user.password) { this.passwordError = 'Mot de passe est obligatoire'; return false; }
    if (this.user.password.length < 6) { this.passwordError = 'Minimum 6 caractères'; return false; }
    this.passwordError = '';
    return true;
  }

  validateRole(): boolean {
    if (!this.user.role) { this.roleError = 'Veuillez sélectionner un rôle'; return false; }
    this.roleError = '';
    return true;
  }

  addUser() {
    console.log('🔴 addUser appelé');
    console.log('Valeurs:', this.user);

    // ✅ Bloquer si document IA non vérifié ou invalide (seulement en mode ajout)
    if (!this.isEditMode) {
      if (!this.verificationResult) {
        alert('⚠️ Veuillez d\'abord vérifier un document IA avant d\'ajouter un utilisateur.');
        return;
      }
      if (!this.verificationResult.valid) {
        alert('❌ Le document IA est invalide. L\'ajout est bloqué.');
        return;
      }
    }

    if (!this.validateEmail()) return;
    if (!this.validateName()) return;
    if (!this.validatePassword()) return;
    if (!this.validateRole()) return;

    this.isLoading = true;
    this.successMessage = '';

    const payload = {
      username: this.user.name,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role
    };

    console.log('📦 Payload envoyé:', payload);

    if (this.isEditMode) {
      this.http.put(`${this.usersUrl1}/${this.user.id}`, payload, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          console.log('✅ Modification réussie:', res);
          this.successMessage = 'Utilisateur modifié avec succès !';
          this.loadUsers();
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('❌ Erreur modification:', err.status, err.error);
          if (err.status === 409) this.emailError = 'Cet email existe déjà';
          else this.emailError = `Erreur ${err.status}: ${err.error}`;
        }
      });
    } else {
      this.http.post(this.registerUrl, payload, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          console.log('✅ Ajout réussi:', res);
          this.successMessage = 'Utilisateur ajouté avec succès !';
          this.loadUsers();
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('❌ Erreur status:', err.status);
          console.error('❌ Erreur body:', err.error);
          if (err.status === 409) this.emailError = 'Cet email existe déjà';
          else this.emailError = `Erreur ${err.status}: ${err.error}`;
        }
      });
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.http.delete(`${this.usersUrl1}/${id}`, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Erreur suppression:', err)
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
    // ✅ Reset aussi la vérification IA après ajout réussi
    this.verificationResult = null;
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  // ✅ Méthodes IA
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.verificationResult = null; // reset résultat à chaque nouveau fichier
    } else {
      alert('Veuillez sélectionner un fichier PDF uniquement.');
    }
  }

  async verifyDocument() {
    if (!this.selectedFile) return;
    this.isVerifying = true;
    this.verificationResult = null;

    try {
      const apiKey = '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';
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
            content: `Voici le contenu d'un document (CV ou diplôme) :
          
${text}

Réponds UNIQUEMENT en JSON sans markdown :
{
  "valid": true ou false,
  "name": "Prénom Nom détecté ou null",
  "message": "Explication courte en français"
}
Critères :
- valid = true si un nom et prénom lisibles sont clairement présents
- valid = false si vide ou sans nom
- name = le nom complet détecté (ou null)
- message = explication en 1 phrase`
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
        message: 'Erreur: ' + (error as any).message
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