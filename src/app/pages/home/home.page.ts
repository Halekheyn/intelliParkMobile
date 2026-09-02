import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { AuthService } from '../../core/auth/auth.service';
import { AuthUser } from '../../core/auth/auth.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar
  ]
})
export class HomePage {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);

  async ionViewWillEnter(): Promise<void> {
    this.user.set(
      await this.authService.getStoredUser()
    );
  }

  async logout(): Promise<void> {

    await this.authService.logout();

    await this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}
