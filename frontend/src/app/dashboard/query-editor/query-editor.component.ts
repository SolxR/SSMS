import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, DbInfo, QueryResult } from '../../services/api.service';

declare const CodeMirror: any;

@Component({
  selector: 'app-query-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatTooltipModule, MatProgressBarModule
  ],
  templateUrl: './query-editor.component.html',
  styleUrl: './query-editor.component.scss'
})
export class QueryEditorComponent implements AfterViewInit, OnChanges {
  @Input() selectedDb: string | null = null;
  @Input() refreshTick = 0;
  @ViewChild('cmHost') cmHost!: ElementRef;

  databases: DbInfo[] = [];
  activeDb: string | null = null;
  loading = false;
  result: QueryResult | null = null;
  error: string | null = null;
  activeTab = 0;
  cmEditor: any = null;

  constructor(private api: ApiService) {
    this.loadDatabases();
  }

  loadDatabases(): void {
    this.api.getDatabases().subscribe(dbs => this.databases = dbs);
  }

  ngAfterViewInit(): void {
    if (typeof CodeMirror !== 'undefined') {
      this.cmEditor = CodeMirror(this.cmHost.nativeElement, {
        mode: 'text/x-sql',
        theme: 'dracula',
        lineNumbers: true,
        autofocus: true,
        indentWithTabs: false,
        tabSize: 2,
        lineWrapping: true,
        extraKeys: {
          'Ctrl-Enter': () => this.execute(),
          'F5': () => this.execute()
        }
      });
      this.cmEditor.setValue('SELECT TOP 10 * FROM sys.databases;');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDb']?.currentValue) {
      this.activeDb = changes['selectedDb'].currentValue;
    }
    if (changes['refreshTick'] && !changes['refreshTick'].firstChange) {
      this.loadDatabases();
    }
  }

  get sqlValue(): string {
    return this.cmEditor ? this.cmEditor.getValue() : '';
  }

  execute(): void {
    const sql = this.sqlValue.trim();
    if (!sql) return;
    this.loading = true;
    this.error = null;
    this.result = null;
    this.api.executeQuery(sql, this.activeDb ?? undefined).subscribe({
      next: res => {
        this.result = res;
        this.activeTab = 0;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.error || 'Erreur lors de l\'exécution.';
        this.loading = false;
      }
    });
  }

  getColumns(recordset: Record<string, unknown>[]): string[] {
    if (!recordset?.length) return [];
    return Object.keys(recordset[0]);
  }

  formatCell(value: unknown): string {
    if (value === null || value === undefined) return 'NULL';
    // Date object
    if (value instanceof Date) {
      return value.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
    // String ISO renvoyée par mssql (ex: "2026-06-08T15:36:55.333Z")
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
    return String(value);
  }

  isNull(value: unknown): boolean {
    return value === null || value === undefined;
  }
}
