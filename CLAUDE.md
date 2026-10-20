# BiblioTK-front-superadmin — App del rol `superadmin`

Parte del sistema BiblioTK (ver `../CLAUDE.md`). Vista y control de usuarios para el rol `superadmin` — es lo que antes hacía el rol `admin` en el front viejo; ese nombre ahora lo tiene un rol distinto (bibliotecario, ver `../BiblioTK-front-admin`). React 19 + React Router 7 + Vite 8 + Tailwind CSS 4.

- **Arranque:** `npm run dev` → http://localhost:5175 (fijo en `vite.config.js`)
- **Docker:** `Dockerfile` en dos etapas (compila con Vite → nginx sin root con `nginx.conf`). Las `VITE_*` quedan fijas al compilar: por defecto, detrás del gateway de `../InfraBiblioTK` (rutas relativas, un solo origen) y con la subruta `/superadmin/`. `VITE_BASE` es esa subruta (`base` de Vite y `basename` del router; en desarrollo, `/`).
- **Librería de interfaz:** `bibliotk-ui` `^0.3.0` **de npm** (repo `UiBiblioTK`), con JS y CSS ya compilados, igual que los otros fronts; `ErrorBoundary` viene de ahí. Antes usaba la copia local `../BiblioTK-ui` (`file:`), con la barra flotante redondeada y pie de página: ahora la cabecera es la misma de las demás apps.
- **CSS:** `src/app/styles/globals.css`, enlazado con `<link>` en `index.html` (no se importa desde `main.jsx`). Ver `../UiBiblioTK/CLAUDE.md`.
- **Íconos:** un import por ícono (`@phosphor-icons/react/UsersThree`); ESLint prohíbe el paquete entero.
- **Carga:** `Home` va en el paquete inicial; la dona (`UserDashboard`) se carga con `React.lazy` y se precarga cuando el navegador queda libre. La sesión se pide al cargar `App.jsx`.
- **Acceso:** solo cuentas `superadmin`, pero el front nunca ve el rol: `esSesionDeEstaApp` (`LoginService.js`) compara el origen del `destino` que devuelve `GET /Sesion` (sin caché) con el de esta app. Sin sesión o con una cuenta de otra app se reemplaza (`location.replace`) por la landing con `?motivo=sesion_expirada|sin_permiso` (URL armada con `new URL(ruta, VITE_LOGIN_APP_URL)`; ver "Mensajes tras un redirect entre apps" en `BiblioTK-front/CLAUDE.md`); cerrar sesión también usa `replace`. La sesión se vuelve a consultar cada vez que la página vuelve a mostrarse (bfcache con "atrás" o al volver a la pestaña) y la página se oculta al salir. Igual que en `BiblioTK-front-user`.

## Estructura

```
src/
  app/
    pages/
      App.jsx           # Rutas, guarda de sesión, PanelLayout
      Home.jsx           # /HomeSuperAdmin — cuadro grande "Usuarios" (cuenta real) + Préstamos/Reportes
      UserDashboard.jsx  # /usuarios — dona de usuarios por rol
  service/
    LoginService.js  # getCurrentSession, esSesionDeEstaApp, logoutUser → :3001
    NotificacionesService.js # conectarNotificaciones → :3006 (Socket.IO)
    UserService.js   # getUserRoleStats → :3004 (BackDashboardBiblioTK, con la cookie de sesión: solo superadmin)
```

Sin tarjeta "Libros" (eso es responsabilidad exclusiva de `admin`/bibliotecario ahora) ni tarjeta de perfil, ni ruta `/perfil` — mismo criterio que el `admin` viejo: los roles de gestión no la tienen.

## `UserDashboard.jsx`

Port casi literal de la dona del front viejo. Único cambio: la etiqueta del segmento `admin` pasó de "Administradores" a **"Bibliotecarios"**, porque ese valor del enum ahora corresponde al rol bibliotecario. La consulta a `BackDashboardBiblioTK` no cambió (el valor en la BD sigue siendo literalmente `admin`).

## Notificaciones en tiempo real

- `src/service/NotificacionesService.js` abre el socket de `NotificacionesBiblioTK` (`/NotificacionesBiblioTK/socket.io`, solo WebSocket) con la cookie de sesión: el servidor decide qué recibe la cuenta, el front no conoce el rol. `VITE_NOTIFICACIONES_URL` (por defecto `http://localhost:3006`; vacía = mismo origen, detrás del gateway).
- `src/app/hooks/useNotificaciones.js` guarda el historial (20, el que manda el servidor al conectar), los avisos emergentes (máximo 3) y las no leídas (marca "leídas hasta" en `localStorage`, por navegador). Se conecta cuando la sesión ya se validó; si el servidor corta el socket (sesión cerrada en otra pestaña, cuenta borrada), revalida la sesión y vuelve a la landing.
- `App.jsx` pinta `NotificationCenter`: botón flotante abajo a la derecha con contador, panel con el historial y avisos arriba a la derecha.
- ⚠️ `src/app/components/NotificationCenter.jsx` y su `.css` son una **copia** de `bibliotk-ui` 0.4.0, que todavía no está publicada. Al publicarla: `npm install bibliotk-ui@^0.4.0`, importar `NotificationCenter` desde `"bibliotk-ui"` en `App.jsx`, borrar la copia y quitar su `@import` de `globals.css`.

## Pendientes conocidos

- `/usuarios` (no `/admin/usuarios`, como en el front viejo): acá `admin` ya es otro rol, ese prefijo confundiría más de lo que aclara.
- `npm run lint` marca `react-hooks/set-state-in-effect` en `UserDashboard.jsx` (`loadRoleStats()` dentro del efecto); ya estaba antes de pasar a `bibliotk-ui` 0.2.0.
- `README.md` sigue siendo la plantilla por defecto de Vite.
