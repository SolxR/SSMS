import { Injectable, signal } from '@angular/core';

export interface ConnectionInfo {
  server: string;
  user: string;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private _connection = signal<ConnectionInfo | null>(null);

  readonly connection = this._connection.asReadonly();

  setConnection(info: ConnectionInfo): void {
    this._connection.set(info);
  }

  clearConnection(): void {
    this._connection.set(null);
  }

  isConnected(): boolean {
    return this._connection() !== null;
  }
}
