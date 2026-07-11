import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

// withHashLocation(): con rutas hash (/angular/#/...) el servidor estático
// nunca ve la ruta interna — no hace falta configurar redirects, tal como
// pide el instructivo para los 3 módulos.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
  ]
};
