# 📦 SmartStock Frontend

Frontend del sistema **SmartStock** para la gestión inteligente de inventario, alertas y depreciación de productos. Desarrollado con **Angular 22**, **Angular Material**, **Tailwind CSS** y conectado a un backend Spring Boot a través de un BFF.

---

## 🚀 Tecnologías

| Tecnología | Versión | Descripción |
|---|---|---|
| Angular | 22 | Framework principal |
| Angular Material | 22 | Componentes UI (mat-table, mat-card, mat-icon, etc.) |
| Tailwind CSS | 4.3 | Utilidades de estilo |
| Vitest | 4.x | Framework de testing unitario |
| TypeScript | 5.x | Lenguaje de desarrollo |

---

## 📁 Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts            # Guard de autenticación (protege rutas)
│   ├── interceptors/
│   │   └── auth.interceptor.ts      # Interceptor HTTP (JWT + X-Comercio-ID)
│   ├── models/
│   │   └── index.ts                 # Modelos/interfaces compartidos
│   └── services/
│       ├── api.service.ts           # Servicio de consumo de API (dashboard, productos, alertas)
│       └── auth.service.ts          # Servicio de autenticación (login, logout, token)
├── features/
│   ├── admin/
│   │   └── admin-global.component   # Panel de administración global
│   ├── alerts/
│   │   ├── alerts.component         # Gestión de alertas pendientes
│   │   └── config.component         # Configuración de reglas de depreciación
│   ├── dashboard/
│   │   └── dashboard.component      # Dashboard principal con resumen consolidado
│   ├── infra/
│   │   └── infra-diag.component     # Diagnóstico de infraestructura
│   ├── inventory/
│   │   └── inventory.component      # Gestión de inventario/productos
│   └── login/
│       └── login.component          # Pantalla de inicio de sesión
├── shared/
│   └── layout/
│       ├── layout.component         # Layout principal (sidebar + navbar + contenido)
│       ├── navbar/                  # Barra de navegación superior
│       └── sidebar/                 # Menú lateral de navegación
├── app.config.ts                    # Configuración de la app (providers, interceptors)
├── app.routes.ts                    # Definición de rutas
└── app.ts                           # Componente raíz
```

---

## 🔧 Requisitos Previos

- **Node.js** >= 18
- **npm** >= 9
- **Angular CLI** >= 22
- **Backend SmartStock** corriendo en `http://localhost:8080` (BFF/Spring Boot)

---

## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd smartstock-frontend

# Instalar dependencias
npm install
```

---

## 🖥️ Servidor de Desarrollo

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. Se recarga automáticamente al modificar archivos fuente.

> El proxy (`proxy.conf.json`) redirige las peticiones `/api` al BFF en `http://localhost:8080`.

---

## 🏗️ Build de Producción

```bash
ng build
```

Los artefactos se generan en el directorio `dist/`.

---

## 🧪 Tests Unitarios

```bash
# Ejecutar tests
npx vitest run

# Ejecutar tests con cobertura
npx vitest run --coverage

# Ejecutar tests en modo watch
npx vitest
```

### Cobertura Actual

| Métrica | Cobertura |
|---|---|
| Statements | 98.69% |
| Functions | 96.36% |
| Lines | 100% |
| Branches | 69.23% |

- **16 archivos de test**
- **50 tests** pasando al 100%

---

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Protegida | Descripción |
|---|---|---|---|
| `/login` | LoginComponent | ❌ | Inicio de sesión |
| `/dashboard` | DashboardComponent | ✅ | Panel principal con resumen |
| `/inventory` | InventoryComponent | ✅ | Gestión de productos |
| `/alerts` | AlertsComponent | ✅ | Alertas pendientes |
| `/config` | ConfigComponent | ✅ | Reglas de depreciación |
| `/admin` | AdminGlobalComponent | ✅ | Administración global |
| `/infra` | InfraDiagComponent | ✅ | Diagnóstico de infraestructura |

Las rutas protegidas requieren autenticación JWT. Si el usuario no está autenticado, se redirige a `/login`.

---

## 🔌 Integración con Backend

### Proxy de Desarrollo

El archivo `proxy.conf.json` redirige las peticiones al BFF:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Endpoints Consumidos

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Autenticación de usuario |
| `GET` | `/api/dashboard` | Datos consolidados del dashboard |
| `GET` | `/api/productos` | Listado de productos |
| `GET` | `/api/alertas` | Listado de alertas |
| `PATCH` | `/api/alertas/{id}/atender` | Marcar alerta como atendida |

### Autenticación

- El **AuthService** gestiona login/logout y almacena el token JWT en `localStorage` (`ss_token`).
- El **authInterceptor** inyecta automáticamente los headers `Authorization: Bearer <token>` y `X-Comercio-ID: 1` en cada petición (excepto `/auth/login`).
- El **authGuard** protege las rutas verificando la existencia del token.

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `ng serve` | Inicia servidor de desarrollo en puerto 4200 |
| `ng build` | Genera build de producción |
| `npx vitest run` | Ejecuta tests unitarios |
| `npx vitest run --coverage` | Ejecuta tests con reporte de cobertura |
| `ng generate component <nombre>` | Genera un nuevo componente |
