import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../firebase.service';
import { UrlDetails } from '../../interfaces/urls';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [MatProgressSpinner, MatButton],
  selector: 'app-redirect',
  styleUrl: './redirect.css',
  templateUrl: './redirect.html',
})
export class Redirect {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly secondsLeft = signal(5);
  private readonly routeParamMap = toSignal(this.route.paramMap);

  private readonly urlId = computed(() => this.routeParamMap()?.get('id') || undefined);
  private readonly firebaseService = inject(FirebaseService);
  url: ResourceRef<UrlDetails | undefined> = resource({
    params: () => this.urlId(),
    loader: ({ params }) => this.firebaseService.findUrlById(params),
    defaultValue: undefined,
  });

  constructor() {
    const id = setInterval(() => {
      this.secondsLeft.update((s) => Math.max(0, s - 1));
      if (this.secondsLeft() === 0) {
        this.doRedirect();
        clearInterval(id);
      }
    }, 1000);

    effect(() => {
      if (!!this.urlId() && !this.url.isLoading() && !this.url.value()) {
        this.router.navigateByUrl('/');
      }
    });

    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  doRedirect() {
    const snap = this.url.value();
    snap?.link && window.location.replace(snap?.link);
  }
}
