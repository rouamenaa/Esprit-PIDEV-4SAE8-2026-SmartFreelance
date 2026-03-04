import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contract } from '../models/Contract';
import { PaginatedResponse } from '../models/PaginatedResponse';
import { ContratService } from './contrat.service';

@Injectable({
  providedIn: 'root',
})
export class ClientcontractService {
  contract: any;
  public subject = new BehaviorSubject<any[]>([]);
  contractData$ = this.subject.asObservable();

  constructor(private contratService: ContratService) {}

  count() {
    return this.contratService.count();
  }

  /** Get all contracts for a client (use getByClientId for filtered) */
  index(clientId?: number): Observable<Contract[]> {
    if (clientId != null) {
      return this.contratService.getByClientId(clientId);
    }
    return this.contratService.getAll();
  }

  fetchPaginatedContracts(page: number = 1): Observable<PaginatedResponse<Contract>> {
    return this.contratService.fetchPaginatedContracts(page, 5);
  }

  store(data: any): Observable<Contract> {
    return this.contratService.create(data);
  }

  update(id: number, data: any): Observable<Contract> {
    return this.contratService.update(id, data);
  }

  delete(id: any): Observable<void> {
    return this.contratService.delete(id);
  }

  getByClientId(clientId: number): Observable<Contract[]> {
    return this.contratService.getByClientId(clientId);
  }
}
