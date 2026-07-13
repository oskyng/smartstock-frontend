import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '403-unauthorized',
    loadComponent: () => import('./features/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/alerts/alerts.component').then(m => m.AlertsComponent),
        canActivate: [roleGuard],
        data: { roles: ['REPONEDOR_SALA'] }
      },
      {
        path: 'config',
        loadComponent: () => import('./features/alerts/config.component').then(m => m.ConfigComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-global.component').then(m => m.AdminGlobalComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_SISTEMA'] }
      },
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_SISTEMA'] }
      },
      {
        path: 'admin/usuarios',
        loadComponent: () => import('./features/usuarios/crear-usuario.component').then(m => m.CrearUsuarioComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_SISTEMA'] }
      },
      {
        path: 'gerencia/usuarios',
        loadComponent: () => import('./features/usuarios/crear-usuario.component').then(m => m.CrearUsuarioComponent),
        canActivate: [roleGuard],
        data: { roles: ['GERENTE_TIENDA'] }
      },
      {
        path: 'gerencia/catalogo',
        loadComponent: () => import('./features/gerencia/catalogo/catalogo.component').then(m => m.CatalogoComponent),
        canActivate: [roleGuard],
        data: { roles: ['GERENTE_TIENDA'] }
      },
      {
        path: 'infra',
        loadComponent: () => import('./features/infra/infra-diag.component').then(m => m.InfraDiagComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_SISTEMA'] }
      },
      {
        path: 'ingreso-mercancia',
        loadComponent: () => import('./features/inventario/ingreso-mercancia/ingreso-mercancia.component').then(m => m.IngresoMercanciaComponent),
        canActivate: [roleGuard],
        data: { roles: ['OPERADOR_INVENTARIO'] }
      },
      {
        path: 'inventario/ingreso',
        loadComponent: () => import('./features/inventario/ingreso-mercancia/ingreso-mercancia.component').then(m => m.IngresoMercanciaComponent),
        canActivate: [roleGuard],
        data: { roles: ['OPERADOR_INVENTARIO'] }
      },
      {
        path: 'bandeja-reponedor',
        loadComponent: () => import('./features/alertas/bandeja-reponedor/bandeja-reponedor.component').then(m => m.BandejaReponedorComponent),
        canActivate: [roleGuard],
        data: { roles: ['REPONEDOR_SALA'] }
      },
      {
        path: 'alertas/bandeja',
        loadComponent: () => import('./features/alertas/bandeja-reponedor/bandeja-reponedor.component').then(m => m.BandejaReponedorComponent),
        canActivate: [roleGuard],
        data: { roles: ['REPONEDOR_SALA'] }
      },
      {
        path: 'dashboard-control',
        loadComponent: () => import('./features/gerencia/dashboard-control/dashboard-control.component').then(m => m.DashboardControlComponent),
        canActivate: [roleGuard],
        data: { roles: ['GERENTE_TIENDA'] }
      },
      {
        path: 'gerencia/dashboard',
        loadComponent: () => import('./features/gerencia/dashboard-control/dashboard-control.component').then(m => m.DashboardControlComponent),
        canActivate: [roleGuard],
        data: { roles: ['GERENTE_TIENDA'] }
      },
      {
        path: 'gerencia/control-auditoria',
        loadComponent: () => import('./features/gerencia/control-auditoria/control-auditoria.component').then(m => m.ControlAuditoriaComponent),
        canActivate: [roleGuard],
        data: { roles: ['GERENTE_TIENDA'] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
