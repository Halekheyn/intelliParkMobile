import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonSpinner,
    IonText
  ]
})
export class LoginPage {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly _authService = inject(AuthService);

  readonly loading = signal(false);
  readonly loginError = signal('');

  readonly loginForm = this.formBuilder.nonNullable.group({
    user_email: [ '', [Validators.required, Validators.email] ],
    user_password: [ '', [Validators.required, Validators.minLength(6)]]
  });

  login(): void {

    this.loginError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this._authService
      .login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home', {
            replaceUrl: true
          });
        },
        error: () => {
          this.loginError.set(
            'No fue posible iniciar sesión. Verifica tus credenciales.'
          );
        }
      });
  }
}
