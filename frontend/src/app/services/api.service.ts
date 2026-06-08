import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:3000/api';
const OPT = { withCredentials: true };

export interface DbInfo {
  name: string;
  state_desc: string;
  recovery_model_desc: string;
  create_date: string;
}

export interface LoginInfo {
  name: string;
  type_desc: string;
  is_disabled: boolean;
  create_date: string;
  default_database_name: string;
}

export interface TableInfo {
  name: string;
  type: string;
  column_count: number;
}

export interface QueryResult {
  recordsets: Record<string, unknown>[][];
  rowsAffected: number[];
  elapsed: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  connect(server: string, port: number, username: string, password: string): Observable<{ message: string; version: string; currentUser: string }> {
    return this.http.post<{ message: string; version: string; currentUser: string }>(`${BASE}/connect`, { server, port, username, password }, OPT);
  }

  disconnect(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${BASE}/disconnect`, {}, OPT);
  }

  status(): Observable<{ connected: boolean; server?: string; user?: string }> {
    return this.http.get<{ connected: boolean; server?: string; user?: string }>(`${BASE}/status`, OPT);
  }

  getDatabases(): Observable<DbInfo[]> {
    return this.http.get<DbInfo[]>(`${BASE}/databases`, OPT);
  }

  createDatabase(name: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${BASE}/databases`, { name }, OPT);
  }

  deleteDatabase(name: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE}/databases/${name}`, OPT);
  }

  getLogins(): Observable<LoginInfo[]> {
    return this.http.get<LoginInfo[]>(`${BASE}/logins`, OPT);
  }

  createLogin(name: string, password: string, defaultDatabase: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${BASE}/logins`, { name, password, defaultDatabase }, OPT);
  }

  deleteLogin(name: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE}/logins/${name}`, OPT);
  }

  getTables(database: string): Observable<TableInfo[]> {
    return this.http.get<TableInfo[]>(`${BASE}/databases/${database}/tables`, OPT);
  }

  executeQuery(sql: string, database?: string): Observable<QueryResult> {
    return this.http.post<QueryResult>(`${BASE}/query`, { sql, database }, OPT);
  }

  backup(database: string, path?: string): Observable<{ message: string; path: string }> {
    return this.http.post<{ message: string; path: string }>(`${BASE}/backup`, { database, path }, OPT);
  }
}
