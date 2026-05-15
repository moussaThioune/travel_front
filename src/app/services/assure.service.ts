import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assure, AssureRequest, AssureStats, NotifManuelleRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AssureService {
  private readonly url = 'https://travel-production-c3e3.up.railway.app/api/assures';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Assure[]> { return this.http.get<Assure[]>(this.url); }
  getById(id: number): Observable<Assure> { return this.http.get<Assure>(`${this.url}/${id}`); }
  create(req: AssureRequest): Observable<Assure> { return this.http.post<Assure>(this.url, req); }
  update(id: number, req: AssureRequest): Observable<Assure> { return this.http.put<Assure>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  search(q: string): Observable<Assure[]> {
    return this.http.get<Assure[]>(`${this.url}/search`, { params: new HttpParams().set('q', q) });
  }

  getEcheancesProches(jours = 30): Observable<Assure[]> {
    return this.http.get<Assure[]>(`${this.url}/echeances`, { params: { jours } });
  }

  getExpires(): Observable<Assure[]> { return this.http.get<Assure[]>(`${this.url}/expires`); }
  getStats(): Observable<AssureStats> { return this.http.get<AssureStats>(`${this.url}/stats`); }

  notifier(id: number, req: NotifManuelleRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/${id}/notifier`, req);
  }

  lancerRappels(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/job/rappels`, {});
  }
}
