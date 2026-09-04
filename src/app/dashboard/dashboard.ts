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
import { DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

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
    MatTooltip,
  ],
  selector: 'app-record',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  generatedURL = signal<string | undefined>(undefined);
  userUrlsListColumns: string[] = ['link', 'shortened', 'createdAt'];

  urlInput = signal('');
  protected readonly firebaseService = inject(FirebaseService);
  readonly userUrlsList = resource({
    params: () => this.firebaseService.isLogged() || undefined,
    loader: () => this.firebaseService.getUserUrlsList(),
    defaultValue: [],
  });
  private readonly snackBar = inject(MatSnackBar);

  async recordUrl() {
    if (!this.firebaseService.isLogged()) {
      return;
    }
    const id = await this.firebaseService.recordUrl(this.urlInput().trim());
    this.snackBar.open('Url Registrato', 'OK', { duration: 2000 });
    this.userUrlsList.reload();
    this.generatedURL.set(this.getShortenedUrl(id));
  }

  protected getShortenedUrl(id: string) {
    return `${window.location.origin}/${id}`;
  }

  protected copyLink(id: string) {
    const shortenedLink = this.getShortenedUrl(id);
    this.copyExactLink(shortenedLink);
  }

  protected copyExactLink(link: string | undefined) {
    link && navigator.clipboard.writeText(link);
    this.snackBar.open('Link Copiato', 'OK', { duration: 2000 });
  }
}
