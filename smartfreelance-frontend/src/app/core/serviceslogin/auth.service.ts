import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {



  private api = "http://localhost:8085/auth";

  //private api = "http://localhost:8085/api/auth";


  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // ✅ Ajouté
  saveRole(role: string) {
    localStorage.setItem('role', role);
  }

  // ✅ Modifié — lit depuis localStorage
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // ✅ Modifié — nettoie aussi le rôle
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  
//    getRole(): string | null {
//     const token = this.getToken();
//     if (!token) return null;
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.role || null;
//     } catch {
//       return null;
//     }
// >>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

