import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';
import { ApiService } from '../services/api.service';
import { ObjectExplorerComponent } from './object-explorer/object-explorer.component';
import { QueryEditorComponent } from './query-editor/query-editor.component';
import { CreateDbDialogComponent } from './admin/create-db-dialog.component';
import { DeleteDbDialogComponent } from './admin/delete-db-dialog.component';
import { CreateLoginDialogComponent } from './admin/create-login-dialog.component';
import { DeleteLoginDialogComponent } from './admin/delete-login-dialog.component';
import { BackupDialogComponent } from './admin/backup-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatToolbarModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatTooltipModule, MatDividerModule,
    ObjectExplorerComponent, QueryEditorComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  selectedDb: string | null = null;

  constructor(
    public auth: AuthStateService,
    private api: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  onDatabaseSelected(db: string): void {
    this.selectedDb = db;
  }

  disconnect(): void {
    this.api.disconnect().subscribe(() => {
      this.auth.clearConnection();
      this.router.navigate(['/login']);
    });
  }

  openCreateDb(): void {
    const ref = this.dialog.open(CreateDbDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) this.refreshExplorer();
    });
  }

  openDeleteDb(): void {
    const ref = this.dialog.open(DeleteDbDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) this.refreshExplorer();
    });
  }

  openCreateLogin(): void {
    const ref = this.dialog.open(CreateLoginDialogComponent, { width: '420px' });
    ref.afterClosed().subscribe(result => {
      if (result) this.refreshExplorer();
    });
  }

  openDeleteLogin(): void {
    const ref = this.dialog.open(DeleteLoginDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) this.refreshExplorer();
    });
  }

  openBackup(): void {
    this.dialog.open(BackupDialogComponent, { width: '460px', data: { selectedDb: this.selectedDb } });
  }

  private refreshExplorer(): void {
    // Signal the object explorer to refresh via a counter
    this._refreshTick = Date.now();
  }

  _refreshTick = 0;
}
