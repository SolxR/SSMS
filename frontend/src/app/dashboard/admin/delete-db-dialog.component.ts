import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, DbInfo } from '../../services/api.service';

@Component({
  selector: 'app-delete-db-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title><mat-icon>remove_circle</mat-icon> Supprimer une base de données</h2>
    <mat-dialog-content>
      <p class="warn-text">Cette action est irréversible. La base sera supprimée définitivement.</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Base à supprimer</mat-label>
        <mat-select [(ngModel)]="selected">
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
      <button mat-flat-button color="warn" (click)="delete()" [disabled]="loading || !selected">
        @if (loading) { <mat-spinner diameter="16" /> } @else { Supprimer }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #f85149; } }
    .full-width { width: 100%; margin-top: 8px; }
    .warn-text { color: #e3b341; font-size: 0.85rem; margin: 4px 0 8px; }
    .dialog-error { color: #f85149; font-size: 0.85rem; margin-top: 4px; }
    .dialog-success { color: #3fb950; font-size: 0.85rem; margin-top: 4px; }
    mat-spinner { display: inline-block; }
  `]
})
export class DeleteDbDialogComponent implements OnInit {
  databases: DbInfo[] = [];
  selected = '';
  loading = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private dialogRef: MatDialogRef<DeleteDbDialogComponent>) {}

  ngOnInit(): void {
    this.api.getDatabases().subscribe(dbs => this.databases = dbs);
  }

  delete(): void {
    if (!this.selected) return;
    this.loading = true; this.error = ''; this.success = '';
    this.api.deleteDatabase(this.selected).subscribe({
      next: res => { this.success = res.message; this.loading = false; setTimeout(() => this.dialogRef.close(true), 1200); },
      error: err => { this.error = err.error?.error || 'Erreur.'; this.loading = false; }
    });
  }
}
