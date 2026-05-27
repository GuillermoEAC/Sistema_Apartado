import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-layout.html',
  styleUrl: './teacher-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherLayoutComponent implements OnInit {

  // Propiedad directa en vez de función user() — evita evaluación en cada CD cycle
  datosUsuario: any = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const sesion = localStorage.getItem('usuario') || localStorage.getItem('user');

    if (sesion) {
      try {
        this.datosUsuario = JSON.parse(sesion);
      } catch {
        this.datosUsuario = null;
      }
    }
  }

  logout() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    // Borramos los datos de la sesión local
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('user');

    // Redirigimos a la pantalla de login (ajusta la ruta '/login' si en tu proyecto se llama diferente)
    this.router.navigate(['/login']);
  }
}
