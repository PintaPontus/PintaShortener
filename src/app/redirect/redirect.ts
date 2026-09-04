import { Component } from '@angular/core';
import { Logo } from '../logo/logo';

@Component({
  imports: [Logo],
  selector: 'app-redirect',
  styleUrl: './redirect.css',
  templateUrl: './redirect.html',
})
export class Redirect {}
