import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private nextId: number = 1;
  emailError: string = '';
  nameError: string = '';

  
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isVerifying: boolean = false;
  verificationResult: { valid: boolean; message: string; name?: string } | null = null;

  ngOnInit() {
    const saved = localStorage.getItem('clients');
    if (saved) {
      this.users = JSON.parse(saved);
      if (this.users.length > 0) {
        this.nextId = Math.max(...this.users.map(u => u.id)) + 1;
      }
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isEmailDuplicate(email: string): boolean {
    return this.users.some(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.id !== this.user.id
    );
  }

  validateEmail(): boolean {
    if (!this.user.email) { this.emailError = 'Email est obligatoire'; return false; }
    if (!this.isValidEmail(this.user.email)) { this.emailError = 'Format email invalide (ex: nom@domaine.com)'; return false; }
    if (this.isEmailDuplicate(this.user.email)) { this.emailError = 'Cet email existe déjà'; return false; }
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

  addUser() {
    if (!this.validateEmail()) return;
    if (!this.validateName()) return;
    if (!this.user.password) return;

    if (this.isEditMode) {
      this.users = this.users.map(u => u.id === this.user.id ? { ...this.user } : u);
      this.isEditMode = false;
    } else {
      this.users.push({ ...this.user, id: this.nextId++ });
    }

    localStorage.setItem('clients', JSON.stringify(this.users));
    this.user = { id: null, email: '', name: '', password: '', role: '' };
    this.emailError = '';
    this.nameError = '';
  }

  editUser(user: any) {
    this.user = { ...user };
    this.isEditMode = true;
    this.emailError = '';
    this.nameError = '';
  }

  deleteUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.users = this.users.filter(u => u.id !== id);
      localStorage.setItem('clients', JSON.stringify(this.users));
    }
  }

  // --- Méthodes IA ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.verificationResult = null;
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