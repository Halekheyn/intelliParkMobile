import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/* Es como el portero de una discoteca. Antes de entrar al dashboard,
   Angular pregunta al guard: "¿tiene permiso?".
   Si no está logueado, lo manda de vuelta al login.
*/

// Función guardia: decide si se puede acceder a una ruta
export const authGuard: CanActivateFn = async () => {

  const _authService = inject(AuthService); // Obtiene el servicio de autenticación
  const router = inject(Router); // Obtiene el router para redirigir

  if (await _authService.isAuthenticated()) { // ¿Está logueado?
    return true; // Sí → permite el acceso
  }

  return router.createUrlTree(['/login']); // No → redirige al login
};
