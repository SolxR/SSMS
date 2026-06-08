import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, DbInfo } from '../../services/api.service';

@Component({
  selector: 'app-create-login-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title><mat-icon>person_add</mat-icon> Créer un login SQL</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nom du login</mat-label>
        <input matInput [(ngModel)]="loginName" placeholder="monLogin" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Mot de passe</mat-label>
        <input matInput [type]="hide ? 'password' : 'text'" [(ngModel)]="password" />
        <button type="button" mat-icon-button matSuffix (click)="hide = !hide">
          <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Base de données par défaut</mat-label>
        <mat-select [(ngModel)]="defaultDb">
          <mat-option value="master">master</mat-option>
          @for (db of databases; track db.name) {
            <mat-option [value]="db.name">{{ db.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (error) { <div class="dialog-error">{{ error }}</div> }
      @if (success) { <div class="dialog-success">{{ success }}</div> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="loading || !loginName || !password">
        @if (loading) { <mat-spinner diameter="16" /> } @else { Créer }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #388bfd; } }
    .full-width { width: 100%; margin-top: 8px; }
    .dialog-error { color: #f85149; font-size: 0.85rem; margin-top: 4px; }
    .dialog-success { color: #3fb950; font-size: 0.85rem; margin-top: 4px; }
    mat-spinner { display: inline-block; }
  `]
})
export class CreateLoginDialogComponent implements OnInit {
  loginName = '';
  password = '';
  defaultDb = 'master';
  hide = true;
  databases: DbInfo[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private dialogRef: MatDialogRef<CreateLoginDialogComponent>) {}

  ngOnInit(): void {
    this.api.getDatabases().subscribe(dbs => this.databases = dbs);
  }

  create(): void {
    if (!this.loginName || !this.password) return;
    this.loading = true; this.error = ''; this.success = '';
    this.api.createLogin(this.loginName, this.password, this.defaultDb).subscribe({
      next: res => { this.success = res.message; this.loading = false; setTimeout(() => this.dialogRef.close(true), 1200); },
      error: err => { this.error = err.error?.error || 'Erreur.'; this.loading = false; }
    });
  }
}
