# BiblioTK-front-superadmin — App del rol `superadmin`

Parte del sistema BiblioTK (ver `../CLAUDE.md`). Vista y control de usuarios para el rol `superadmin` — es lo que antes hacía el rol `admin` en el front viejo; ese nombre ahora lo tiene un rol distinto (bibliotecario, ver `../BiblioTK-front-admin`). React 19 + React Router 7 + Vite 8 + Tailwind CSS 4.

- **Arranque:** `npm run dev` → http://localhost:5175 (fijo en `vite.config.js`)
- **Librería de interfaz:** `bibliotk-ui` `^0.2.0` **de npm** (repo `UiBiblioTK`), con JS y CSS ya compilados, igual que los otros fronts; `ErrorBoundary` viene de ahí. Antes usaba la copia local `../BiblioTK-ui` (`file:`), con la barra flotante redondeada y pie de página: ahora la cabecera es la misma de las demás apps.
- **CSS:** `src/app/styles/globals.css`, enlazado con `<link>` en `index.html` (no se importa desde `main.jsx`). Ver `../UiBiblioTK/CLAUDE.md`.
- **Íconos:** un import por ícono (`@phosphor-icons/react/UsersThree`); ESLint prohíbe el paquete entero.
- **Carga:** `Home` va en el paquete inicial; la dona (`UserDashboard`) se carga con `React.lazy` y se precarga cuando el navegador queda libre. La sesión se pide al cargar `App.jsx`.
- **Acceso:** solo rol `superadmin`. Sin sesión o con otro rol, redirige a `${LOGIN_URL}/login?motivo=sesion_expirada|sin_permiso` (ver "Mensajes tras un redirect entre apps" en `BiblioTK-front/CLAUDE.md`).

## Estructura

```
src/
  app/
    pages/
      App.jsx           # Rutas, guarda de rol "superadmin", PanelLayout
      Home.jsx           # /HomeSuperAdmin — cuadro grande "Usuarios" (cuenta real) + Préstamos/Reportes
      UserDashboard.jsx  # /usuarios — dona de usuarios por rol
  service/
    LoginService.js  # getCurrentSession, logoutUser → :3001
    UserService.js   # getUserRoleStats → :3002 (BackDashboardBiblioTK)
```

Sin tarjeta "Libros" (eso es responsabilidad exclusiva de `admin`/bibliotecario ahora) ni tarjeta de perfil, ni ruta `/perfil` — mismo criterio que el `admin` viejo: los roles de gestión no la tienen.

## `UserDashboard.jsx`

Port casi literal de la dona del front viejo. Único cambio: la etiqueta del segmento `admin` pasó de "Administradores" a **"Bibliotecarios"**, porque ese valor del enum ahora corresponde al rol bibliotecario. La consulta a `BackDashboardBiblioTK` no cambió (el valor en la BD sigue siendo literalmente `admin`).

## Pendientes conocidos

- `/usuarios` (no `/admin/usuarios`, como en el front viejo): acá `admin` ya es otro rol, ese prefijo confundiría más de lo que aclara.
- `npm run lint` marca `react-hooks/set-state-in-effect` en `UserDashboard.jsx` (`loadRoleStats()` dentro del efecto); ya estaba antes de pasar a `bibliotk-ui` 0.2.0.
- `README.md` sigue siendo la plantilla por defecto de Vite.
