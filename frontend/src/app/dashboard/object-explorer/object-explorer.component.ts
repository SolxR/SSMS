import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService, DbInfo, LoginInfo, TableInfo } from '../../services/api.service';

interface DbNode extends DbInfo {
  expanded: boolean;
  loadingTables: boolean;
  tables: TableInfo[];
}

@Component({
  selector: 'app-object-explorer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './object-explorer.component.html',
  styleUrl: './object-explorer.component.scss'
})
export class ObjectExplorerComponent implements OnInit, OnChanges {
  @Input() refreshTick = 0;
  @Output() dbSelected = new EventEmitter<string>();

  databases: DbNode[] = [];
  logins: LoginInfo[] = [];
  loadingDbs = false;
  loadingLogins = false;
  dbsExpanded = true;
  loginsExpanded = true;
  selectedDb: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTick'] && !changes['refreshTick'].firstChange) this.load();
  }

  load(): void {
    this.loadingDbs = true;
    this.api.getDatabases().subscribe({
      next: dbs => {
        const prevMap = new Map(this.databases.map(d => [d.name, d]));
        this.databases = dbs.map(db => {
          const prev = prevMap.get(db.name);
          const node: DbNode = {
            ...db,
            expanded: prev?.expanded ?? false,
            loadingTables: false,
            tables: prev?.tables ?? []
          };
          // Recharge les tables si la base était déjà dépliée
          if (node.expanded) {
            this.loadTables(node);
          }
          return node;
        });
        this.loadingDbs = false;
      },
      error: () => { this.loadingDbs = false; }
    });

    this.loadingLogins = true;
    this.api.getLogins().subscribe({
      next: logins => { this.logins = logins; this.loadingLogins = false; },
      error: () => { this.loadingLogins = false; }
    });
  }

  toggleDb(db: DbNode): void {
    if (!db.expanded && db.tables.length === 0) {
      this.loadTables(db);
    }
    db.expanded = !db.expanded;
    if (db.expanded) {
      this.selectedDb = db.name;
      this.dbSelected.emit(db.name);
    }
  }

  loadTables(db: DbNode): void {
    db.loadingTables = true;
    this.api.getTables(db.name).subscribe({
      next: tables => { db.tables = tables; db.loadingTables = false; },
      error: () => { db.loadingTables = false; }
    });
  }

  selectDb(db: DbNode): void {
    this.selectedDb = db.name;
    this.dbSelected.emit(db.name);
  }

  getDbColor(state: string): string {
    return state === 'ONLINE' ? '#3fb950' : '#f85149';
  }
}
