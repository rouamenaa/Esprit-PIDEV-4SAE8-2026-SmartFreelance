import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contract } from '../models/Contract';
import { PaginatedResponse } from '../models/PaginatedResponse';
import { ContratService } from './contrat.service';

@Injectable({
  providedIn: 'root',
})
export class FreelancercontractService {
  contract: any;
  public subject = new BehaviorSubject<Contract[]>([]);
  contractData$ = this.subject.asObservable();

  constructor(private contratService: ContratService) {}

  count() {
    return this.contratService.count();
  }

  /** Get all contracts for a freelancer (use getByFreelancerId for filtered) */
  index(freelancerId?: number): Observable<Contract[]> {
    if (freelancerId != null) {
      return this.contratService.getByFreelancerId(freelancerId);
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

  showbyclient(client_id: number): Observable<Contract[]> {
    return this.contratService.getByClientId(client_id);
  }

  showbyfreelancer(freelancer_id: number): Observable<Contract[]> {
    return this.contratService.getByFreelancerId(freelancer_id);
  }
}
