import { Component, inject, Signal } from '@angular/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { User } from '@firebase/auth';
import { FirebaseService } from '../firebase.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-toolbar',
  imports: [MatMenu, MatMenuItem, MatTooltip, MatMenuTrigger, MatToolbar, Logo],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  private readonly firebaseService = inject(FirebaseService);
  user: Signal<User | undefined> = this.firebaseService.getUserSessionDetails();
  isLogged: Signal<boolean> = this.firebaseService.isLogged;
  private readonly snackBar = inject(MatSnackBar);

  async loginWithGoogle() {
    try {
      await this.firebaseService.loginWithGoogle();
      this.snackBar.open('Login completato', 'OK', { duration: 2000 });
    } catch (e) {
      this.snackBar.open(e as string, 'OK', { duration: 2000 });
      console.error(e);
    }
  }

  async logout() {
    await this.firebaseService.logout();
  }
}
