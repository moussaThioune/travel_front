import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  messages: string[];
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly url = 'https://travel-production-c3e3.up.railway.app/api/import';
  constructor(private http: HttpClient) {}

  importAssuresExcel(file: File): Observable<ImportResult> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<ImportResult>(`${this.url}/assures/excel`, fd);
  }
}
