import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
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
        loadComponent: () => import('./features/alerts/alerts.component').then(m => m.AlertsComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./features/alerts/config.component').then(m => m.ConfigComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-global.component').then(m => m.AdminGlobalComponent)
      },
      {
        path: 'infra',
        loadComponent: () => import('./features/infra/infra-diag.component').then(m => m.InfraDiagComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
