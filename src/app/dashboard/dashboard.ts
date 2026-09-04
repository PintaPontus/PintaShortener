import { Component, inject, resource, signal } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { FirebaseService } from '../firebase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  imports: [
    MatLabel,
    MatFormField,
    MatInput,
    FormsModule,
    MatButton,
    MatHeaderRow,
    MatRow,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatTable,
    MatColumnDef,
    MatHeaderRowDef,
    MatRowDef,
    DatePipe,
  ],
  selector: 'app-record',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  userUrlsListColumns: string[] = ['link', 'createdAt'];
  urlInput = signal('');
  page = signal(1);
  private readonly firebaseService = inject(FirebaseService);
  readonly userUrlsList = resource({
    params: () => this.firebaseService.isLogged() || undefined,
    loader: () => this.firebaseService.getUserUrlsList(),
    defaultValue: [],
  });
  private readonly snackBar = inject(MatSnackBar);

  async recordUrl() {
    await this.firebaseService.recordUrl(this.urlInput().trim());
    this.snackBar.open('Url Registrato', 'OK', { duration: 2000 });
    this.userUrlsList.reload();
  }

  async getUserUrlsList() {
    await this.firebaseService.getUserUrlsList();
  }

  changePage($event: PageEvent) {
    this.page.set($event.pageIndex + 1);
  }
}
