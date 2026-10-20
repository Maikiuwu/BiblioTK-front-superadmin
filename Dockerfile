# Imagen de la app del superadministrador. Etapa 1: compila con Vite. Las variables VITE_* quedan fijas en el
# código compilado, así que se pasan aquí: por defecto, detrás del gateway (rutas relativas,
# un solo origen) y con la subruta /superadmin/
FROM node:24-alpine AS compilacion

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_BASE=/superadmin/
ARG VITE_LOGIN_APP_URL=/
ARG VITE_SESSION_URL=/BiblioTK/Sesion
ARG VITE_LOGOUT_URL=/BiblioTK/Logout
ARG VITE_USERS_DASHBOARD_URL=/DashboardBibliotk/Udashboard
ARG VITE_NOTIFICACIONES_URL=
ENV VITE_BASE=$VITE_BASE \
    VITE_LOGIN_APP_URL=$VITE_LOGIN_APP_URL \
    VITE_SESSION_URL=$VITE_SESSION_URL \
    VITE_LOGOUT_URL=$VITE_LOGOUT_URL \
    VITE_USERS_DASHBOARD_URL=$VITE_USERS_DASHBOARD_URL \
    VITE_NOTIFICACIONES_URL=$VITE_NOTIFICACIONES_URL
RUN npm run build

# Etapa 2: solo los archivos estáticos, servidos por nginx sin root
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist /usr/share/nginx/html
EXPOSE 8080
