import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, LoginInfo } from '../../services/api.service';

@Component({
  selector: 'app-delete-login-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title><mat-icon>person_remove</mat-icon> Supprimer un login</h2>
    <mat-dialog-content>
      <p class="warn-text">Le login sera supprimé définitivement de l'instance SQL.</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Login à supprimer</mat-label>
        <mat-select [(ngModel)]="selected">
          @for (login of logins; track login.name) {
            <mat-option [value]="login.name">{{ login.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (error) { <div class="dialog-error">{{ error }}</div> }
      @if (success) { <div class="dialog-success">{{ success }}</div> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="warn" (click)="deleteLogin()" [disabled]="loading || !selected">
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
export class DeleteLoginDialogComponent implements OnInit {
  logins: LoginInfo[] = [];
  selected = '';
  loading = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private dialogRef: MatDialogRef<DeleteLoginDialogComponent>) {}

  ngOnInit(): void {
    this.api.getLogins().subscribe(logins => this.logins = logins);
  }

  deleteLogin(): void {
    if (!this.selected) return;
    this.loading = true; this.error = ''; this.success = '';
    this.api.deleteLogin(this.selected).subscribe({
      next: res => { this.success = res.message; this.loading = false; setTimeout(() => this.dialogRef.close(true), 1200); },
      error: err => { this.error = err.error?.error || 'Erreur.'; this.loading = false; }
    });
  }
}
