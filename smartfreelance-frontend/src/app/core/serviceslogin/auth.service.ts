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
    localStorage.setItem('role', this.normalizeRole(role));
  }

  saveUserId(userId: number) {
    localStorage.setItem('userId', String(userId));
  }

  // ✅ Modifié — lit depuis localStorage
  getRole(): string | null {
    const fromStorage = localStorage.getItem('role');
    if (fromStorage) return this.normalizeRole(fromStorage);

    const claims = this.getTokenClaims();
    const roleCandidate = claims?.role ?? claims?.authorities?.[0] ?? claims?.scope;
    if (typeof roleCandidate === 'string' && roleCandidate.trim().length > 0) {
      return this.normalizeRole(roleCandidate);
    }
    return null;
  }

  getUserId(): number | null {
    const fromStorage = localStorage.getItem('userId');
    if (fromStorage) {
      const parsed = Number(fromStorage);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    const claims = this.getTokenClaims();
    const candidate = claims?.userId ?? claims?.id ?? claims?.uid ?? claims?.sub;
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  // ✅ Modifié — nettoie aussi le rôle
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  
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

  extractUserIdFromLoginResponse(response: any): number | null {
    const direct = Number(response?.userId ?? response?.id ?? response?.uid);
    if (Number.isFinite(direct) && direct > 0) return direct;

    const claims = this.getTokenClaimsFromRaw(response?.token);
    const candidate = claims?.userId ?? claims?.id ?? claims?.uid ?? claims?.sub;
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  extractRoleFromLoginResponse(response: any): string | null {
    const direct = response?.role ?? response?.authority;
    if (typeof direct === 'string' && direct.trim().length > 0) {
      return this.normalizeRole(direct);
    }

    const claims = this.getTokenClaimsFromRaw(response?.token);
    const fromToken = claims?.role ?? claims?.authorities?.[0] ?? claims?.scope;
    if (typeof fromToken === 'string' && fromToken.trim().length > 0) {
      return this.normalizeRole(fromToken);
    }
    return null;
  }

  private normalizeRole(role: string): string {
    return role.replace(/^ROLE_/, '').toUpperCase();
  }

  private getTokenClaims(): any | null {
    return this.getTokenClaimsFromRaw(this.getToken());
  }

  private getTokenClaimsFromRaw(token: string | null | undefined): any | null {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
