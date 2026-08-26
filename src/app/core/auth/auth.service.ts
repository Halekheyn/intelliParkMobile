import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { from, map, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from './auth.interface';
/*
  •	@Injectable({ providedIn: 'root' }) → Patrón Singleton: un solo objeto compartido por toda la app
  •	signal() → Nueva forma reactiva de Angular. Reemplaza a las variables normales cuando necesitas que la UI reaccione a cambios
*/

 // Clave para guardar en sesión del dispositivo
  export const AUTH_TOKEN_KEY = 'intellipark_token';
  export const AUTH_USER_KEY = 'intellipark_user';

/**
 * Este servicio es para realizar la autenticación del usuario en nuestro sistema
 */
@Injectable({
  providedIn: 'root' // Este servicio existe UNA sola vez en toda la app (Singleton)
})
export class AuthService {

  private readonly httpClient = inject(HttpClient);

   private readonly apiBaseUrl = Capacitor.getPlatform() === 'android'
      ? environment.apiAndroidUrl
      : environment.apiBrowserUrl;

  // Método que intenta hacer login
  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.httpClient
                .post<LoginResponse>(
                                      `${this.apiBaseUrl}/auth/user-login`,
                                      credentials
                                    )
               .pipe(
                  switchMap((response) =>
                    from(this.saveSession(response)).pipe(
                      map(() => response)
                    )
                  )
                );

  }

  private async saveSession(response: LoginResponse): Promise<void> {

    if (!response.data?.token || !response.data?.user) {
      throw new Error('La respuesta de autenticación no es válida.');
    }

    await Promise.all([
      Preferences.set({
        key: AUTH_TOKEN_KEY,
        value: response.data.token
      }),
      Preferences.set({
        key: AUTH_USER_KEY,
        value: JSON.stringify(response.data.user)
      })
    ]);
  }

  /*getCurrentUser(): Observable<AuthUser | null> {

    /*return this.httpClient.get<UserMeResponse>(`${this.apiBaseUrl}/auth/user-me`)
               .pipe(
                  map((response) => response.data ?? null),
                  tap((userMe) => {
                    if (userMe) {
                      localStorage.setItem(this.userKey, JSON.stringify(userMe));
                    }
                  })
                );
  }*/

  async getToken(): Promise<string | null> {

    const { value } = await Preferences.get({
      key: AUTH_TOKEN_KEY
    });
    return value;
  }

  async getStoredUser(): Promise<AuthUser | null> {

    const { value } = await Preferences.get({
      key: AUTH_USER_KEY
    });

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getToken());
  }

  async logout(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: AUTH_TOKEN_KEY }),
      Preferences.remove({ key: AUTH_USER_KEY })
    ]);
  }
}
