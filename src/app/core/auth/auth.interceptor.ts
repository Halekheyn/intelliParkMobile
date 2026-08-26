import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { from, switchMap } from 'rxjs';

import { AUTH_TOKEN_KEY } from './auth.service';

export const authInterceptorFn: HttpInterceptorFn = (request, next) => {

  if (request.url.includes('/auth/user-login')) {
    return next(request);
  }

  return from(
    Preferences.get({ key: AUTH_TOKEN_KEY })
  ).pipe(
    switchMap(({ value: token }) => {
      if (!token) {
        return next(request);
      }

      const authenticatedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authenticatedRequest);
    })
  )
};
