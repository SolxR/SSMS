import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../services/api.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  server = 'localhost';
  port = 1433;
  username = '';
  password = '';
  hidePassword = true;
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private auth: AuthStateService,
    private router: Router
  ) {}

  connect(): void {
    if (!this.server || !this.username || !this.password) {
      this.error = 'Tous les champs sont requis.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.api.connect(this.server, this.port, this.username, this.password).subscribe({
      next: (res) => {
        this.auth.setConnection({ server: this.server, user: res.currentUser, version: res.version });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur de connexion.';
        this.loading = false;
      }
    });
  }
}
