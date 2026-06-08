import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, DbInfo } from '../../services/api.service';

@Component({
  selector: 'app-backup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title><mat-icon>backup</mat-icon> Sauvegarder une base de données</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Base à sauvegarder</mat-label>
        <mat-select [(ngModel)]="selectedDb">
          @for (db of databases; track db.name) {
            <mat-option [value]="db.name">{{ db.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Chemin de destination (optionnel)</mat-label>
        <mat-icon matPrefix>folder</mat-icon>
        <input matInput [(ngModel)]="backupPath" placeholder="C:\\Backup\\MaBase.bak" />
        <mat-hint>Laisser vide pour utiliser C:\Backup\&lt;base&gt;_&lt;date&gt;.bak</mat-hint>
      </mat-form-field>
      @if (error) { <div class="dialog-error">{{ error }}</div> }
      @if (success) {
        <div class="dialog-success">
          <mat-icon>check_circle</mat-icon> {{ success }}
          @if (resultPath) { <div class="result-path">{{ resultPath }}</div> }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="!!success">{{ success ? 'Fermer' : 'Annuler' }}</button>
      @if (!success) {
        <button mat-flat-button color="primary" (click)="backup()" [disabled]="loading || !selectedDb">
          @if (loading) { <mat-spinner diameter="16" /> } @else { <mat-icon>backup</mat-icon> Lancer la sauvegarde }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #e3b341; } }
    .full-width { width: 100%; margin-top: 8px; }
    .dialog-error { color: #f85149; font-size: 0.85rem; margin-top: 8px; }
    .dialog-success { display: flex; align-items: flex-start; gap: 6px; color: #3fb950; font-size: 0.85rem; margin-top: 8px;
      mat-icon { font-size: 18px; width: 18px; flex-shrink: 0; } }
    .result-path { color: #8b949e; font-family: monospace; font-size: 0.78rem; margin-top: 4px; word-break: break-all; }
    mat-spinner { display: inline-block; }
  `]
})
export class BackupDialogComponent implements OnInit {
  databases: DbInfo[] = [];
  selectedDb = '';
  backupPath = '';
  loading = false;
  error = '';
  success = '';
  resultPath = '';

  constructor(
    private api: ApiService,
    private dialogRef: MatDialogRef<BackupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { selectedDb: string | null }
  ) {
    if (data?.selectedDb) this.selectedDb = data.selectedDb;
  }

  ngOnInit(): void {
    this.api.getDatabases().subscribe(dbs => {
      this.databases = dbs;
      if (!this.selectedDb && dbs.length) this.selectedDb = dbs[0].name;
    });
  }

  backup(): void {
    if (!this.selectedDb) return;
    this.loading = true; this.error = ''; this.success = '';
    this.api.backup(this.selectedDb, this.backupPath || undefined).subscribe({
      next: res => { this.success = res.message; this.resultPath = res.path; this.loading = false; },
      error: err => { this.error = err.error?.error || 'Erreur lors de la sauvegarde.'; this.loading = false; }
    });
  }
}
