import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:8080'; // backend url

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${BASE_URL}/${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${BASE_URL}/${endpoint}`, data);
  }

  postText(endpoint: string, data: any): Observable<string> {
    return this.http.post(`${BASE_URL}/${endpoint}`, data, { responseType: 'text' });
  }
}
