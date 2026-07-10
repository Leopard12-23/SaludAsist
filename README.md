# 🩺 SaludAsist

Sistema de pre-diagnóstico médico con IA basado en reglas, 100% local y privado. Construido con **Vue 3 + TypeScript + Vite**.

> ⚠️ **Aviso importante:** SaludAsist es una herramienta educativa. **No reemplaza una consulta médica profesional.** En una emergencia, llama al 911 o al servicio de emergencias de tu país.

---

## ✨ Qué hace

- **Evaluación de síntomas interactiva**: un menú dinámico de 10 categorías (🫁 Respiratorio, 🧠 Neurológico, 🫃 Digestivo, ❤️ Cardiovascular, 🧘 Ánimo y sueño, entre otras) con 51 síntomas seleccionables. Al marcar una categoría se despliegan sus síntomas relacionados.
- **Motor de diagnóstico** con 29 reglas: compara los síntomas marcados y devuelve hasta 3 posibles diagnósticos (el más probable primero), con gravedad, derivación sugerida y recomendaciones. La edad influye levemente en el resultado.
- **3 roles con pantallas propias**, no solo botones distintos:
  - 🩹 **Paciente**: evalúa síntomas, ve su propio historial, exporta a PDF, imprime.
  - 🧑‍⚕️ **Doctor**: ve la lista de pacientes registrados, el historial de cada uno, y puede dejar una nota clínica por evaluación.
  - 🛡️ **Administrador**: gestiona usuarios (cambia roles, activa/desactiva cuentas), asigna pacientes a doctores, **administra el catálogo de enfermedades** (agregar/editar/borrar), ve reportes del sistema, y puede exportar/restaurar un respaldo completo de los datos.
- **Cuentas de usuario propias**: registro, login, recuperación de contraseña con código de 6 dígitos, límite de intentos fallidos, contraseñas con hash + salt (nunca en texto plano).
- **Rutas reales** (Vue Router): `/login`, `/paciente`, `/doctor`, `/admin`, con guardas de navegación que redirigen según la sesión y el rol.
- **Modales y avisos propios** (sin `alert()`/`confirm()` del navegador).
- **Instalable como PWA** y funciona sin conexión (todo es local).

## 🔒 Sobre la privacidad (y sus límites, con honestidad)

Esta app **no tiene backend ni base de datos real**: todo se guarda en el `localStorage`/`sessionStorage` del navegador. Eso significa:

- Tus datos nunca salen de tu dispositivo — no hay servidor que los reciba.
- Pero también significa que **no es tan seguro como un sistema real con backend**. Cualquier persona con acceso técnico a tu navegador podría inspeccionar esos datos. El hashing de contraseñas, el límite de intentos, etc. siguen buenas prácticas, pero no sustituyen a un servidor con HTTPS, base de datos real y autenticación del lado del servidor.
- Si se borra el navegador (o el `localStorage`), **se pierde todo**. Por eso existe la función de respaldo (exportar/importar `.json`) en el panel del administrador.

## 🛠️ Stack técnico

| Área | Tecnología |
|---|---|
| Framework | Vue 3 (`<script setup>`, Composition API) |
| Lenguaje | TypeScript |
| Build | Vite |
| Routing | Vue Router 4 (rutas reales + guardas de navegación) |
| Tests | Vitest + jsdom |
| Lint | ESLint (flat config) + `eslint-plugin-vue` + `@typescript-eslint` |
| Estilos | CSS con variables (sin frameworks externos) |
| Exportar PDF | html2pdf.js (CDN) |

## 📁 Estructura del proyecto

```
src/
├── almacenamiento/
│   ├── cuentas-usuarios.ts       # Registro, login, sesión, roles
│   └── cuentas-usuarios.test.ts  # Tests de lo anterior
├── logica/
│   ├── categorias.ts             # Las 10 categorías y 51 síntomas
│   ├── catalogo-enfermedades.ts  # Las 29 reglas de diagnóstico "de fábrica" (semilla)
│   ├── gestion-enfermedades.ts   # CRUD editable del catálogo (el admin agrega/edita/borra)
│   ├── gestion-enfermedades.test.ts
│   ├── motor-diagnostico.ts      # Compara síntomas → devuelve resultados
│   ├── motor-diagnostico.test.ts # Tests del motor
│   ├── asignaciones.ts           # Qué paciente tiene asignado qué doctor
│   ├── historial-evaluaciones.ts # Guardar/leer evaluaciones por paciente
│   ├── opciones-por-rol.ts       # Textos de cada rol
│   ├── disponibilidad.ts         # Estado "disponible" del doctor
│   ├── respaldo.ts               # Exportar/importar todos los datos
│   ├── usar-tema.ts              # Claro/oscuro
│   ├── usar-notificaciones.ts    # Toasts (reemplaza alert())
│   └── usar-confirmacion.ts      # Modal de confirmación (reemplaza confirm())
├── router/
│   └── index.ts                  # Rutas + guarda de navegación por rol
├── componentes/                  # Piezas reutilizables (modales, tarjetas, etc.)
├── vistas/
│   ├── VistaLogin.vue
│   ├── VistaPaciente.vue
│   ├── VistaDoctor.vue
│   └── VistaAdmin.vue
├── tipos/tipos.ts                # Tipos compartidos
└── App.vue                       # Nav + <router-view>
```

## 🚀 Cómo correrlo

Requiere Node 18 o superior.

```bash
npm install       # instala dependencias
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # build de producción (carpeta dist/)
npm run preview   # previsualizar el build de producción
npm run test      # corre los tests una vez
npm run test:watch  # tests en modo watch
npm run lint      # revisa el código con ESLint
```

## 🔑 Cuentas de prueba

Se crean automáticamente la primera vez que se abre la app:

| Rol | Correo | Contraseña |
|---|---|---|
| 🛡️ Administrador | `admin@saludasist.com` | `Admin123!` |
| 🧑‍⚕️ Doctor | `doctor@saludasist.com` | `Doctor123!` |
| 🩹 Paciente | `paciente@saludasist.com` | `Paciente123!` |

## 🌐 Despliegue

La app usa `createWebHistory` (URLs limpias, sin `#`). Si la subes a un hosting estático, necesitas una regla de redirección para que refrescar en `/paciente` (por ejemplo) no dé error 404:

- **Netlify**: ya incluye `public/_redirects` con la regla lista.
- **Vercel**: agrega un `vercel.json` con un rewrite a `/index.html`.
- **GitHub Pages**: no soporta esto de forma nativa; considera usar `createWebHashHistory` en `src/router/index.ts` si vas a desplegar ahí.

## 📌 Limitaciones conocidas (honestas)

- El catálogo de 29 enfermedades cubre motivos de consulta frecuentes y señales de alarma — **no es una lista exhaustiva de todas las enfermedades existentes** (son decenas de miles).
- El ajuste por edad en el motor de diagnóstico es una heurística simple, no un criterio médico riguroso.
- No hay backend: dos personas usando el mismo navegador comparten el mismo `localStorage` (aunque el historial de evaluaciones sí está separado por cuenta).

## 📄 Licencia

Proyecto educativo/de portafolio. Sin licencia comercial definida todavía.
