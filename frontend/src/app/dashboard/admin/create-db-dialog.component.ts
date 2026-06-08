import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-create-db-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title><mat-icon>add_circle</mat-icon> Créer une base de données</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nom de la base</mat-label>
        <input matInput [(ngModel)]="dbName" placeholder="MaBase" (keyup.enter)="create()" />
      </mat-form-field>
      @if (error) { <div class="dialog-error">{{ error }}</div> }
      @if (success) { <div class="dialog-success">{{ success }}</div> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="loading || !dbName">
        @if (loading) { <mat-spinner diameter="16" /> } @else { Créer }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #3fb950; } }
    .full-width { width: 100%; margin-top: 8px; }
    .dialog-error { color: #f85149; font-size: 0.85rem; margin-top: 4px; }
    .dialog-success { color: #3fb950; font-size: 0.85rem; margin-top: 4px; }
    mat-spinner { display: inline-block; }
  `]
})
export class CreateDbDialogComponent {
  dbName = '';
  loading = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private dialogRef: MatDialogRef<CreateDbDialogComponent>) {}

  create(): void {
    if (!this.dbName) return;
    this.loading = true; this.error = ''; this.success = '';
    this.api.createDatabase(this.dbName).subscribe({
      next: res => { this.success = res.message; this.loading = false; setTimeout(() => this.dialogRef.close(true), 1200); },
      error: err => { this.error = err.error?.error || 'Erreur.'; this.loading = false; }
    });
  }
}
