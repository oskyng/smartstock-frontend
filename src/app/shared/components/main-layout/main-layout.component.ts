import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  rol: string = '';
  idComercio: string | null = null;

  adminMenu: MenuItem[] = [
    { label: 'Dashboard de Control', link: '/admin/dashboard', icon: '📊' },
    { label: 'Alta de Comercios (Tenants)', link: '/admin/dashboard', icon: '🏪' },
    { label: 'Monitoreo de Regiones', link: '/admin/dashboard', icon: '🌎' }
  ];

  gerenteMenu: MenuItem[] = [
    { label: 'Resumen de Tienda', link: '/gerencia/dashboard', icon: '🏬' },
    { label: 'Reglas de Depreciación', link: '/gerencia/dashboard', icon: '💲' },
    { label: 'Auditoría de SLAs (Escaladas)', link: '/gerencia/dashboard', icon: '📋' }
  ];

  operadorMenu: MenuItem[] = [
    { label: 'Ingresar Mercancía', link: '/inventario/ingreso', icon: '📦' },
    { label: 'Historial de Lotes', link: '/inventario/historial', icon: '📜' }
  ];

  reponedorMenu: MenuItem[] = [
    { label: 'Bandeja de Reetiquetado', link: '/alertas/bandeja', icon: '🏷️' },
    { label: 'Alertas Atendidas', link: '/alertas/historial', icon: '✅' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.idComercio = localStorage.getItem('idComercio') || null;
  }

  isAdminSistema(): boolean {
    return this.rol === 'ADMIN_SISTEMA';
  }

  isGerenteTienda(): boolean {
    return this.rol === 'GERENTE_TIENDA';
  }

  isOperadorInventario(): boolean {
    return this.rol === 'OPERADOR_INVENTARIO';
  }

  isReponedorSala(): boolean {
    return this.rol === 'REPONEDOR_SALA';
  }

  logout(): void {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    localStorage.removeItem('ss_comercio_id');
    localStorage.removeItem('rol');
    localStorage.removeItem('idComercio');
    this.router.navigate(['/login']);
  }
}
