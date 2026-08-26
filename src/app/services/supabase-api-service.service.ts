/* import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupabaseApiServiceService {

  constructor() { }
}
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseApiService {
  private apiUrl = 'https://jcdufidbcmsejwuqwlaf.supabase.co/rest/v1/rpc/calcular_equilibrio';
  private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZHVmaWRiY21zZWp3dXF3bGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTQ4MzMsImV4cCI6MjA3OTk3MDgzM30.yx9PtlgVXb4i1984nu10aHAT-3zBT6WRHu-Ok7hmk04'; // pon tu apikey aquí

  constructor(private http: HttpClient) {}

  calcularEquilibrio(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`
    });

    return this.http.post(this.apiUrl, params, { headers });
  }
}
