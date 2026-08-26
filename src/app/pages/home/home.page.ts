import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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

  private readonly _authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly message = signal('');

  async ionViewWillEnter(): Promise<void> {
    this.user.set(await this._authService.getStoredUser());
  }

  showNextStep(): void {
    this.message.set(
      'La captura y lectura de la placa se implementará en la siguiente sesión.'
    );
  }

  async logout(): Promise<void> {
    await this._authService.logout();

    await this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}
