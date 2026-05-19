import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <-- 1. Importamos Router para redireccionar

@Component({
  selector: 'app-teacher-layout', // Deja el selector que ya tengas
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-layout.html',
  styleUrl: './teacher-layout.scss' // (o styleUrls dependiendo tu versión)
})
export class TeacherLayoutComponent implements OnInit {

  // Aquí guardaremos todo el objeto del usuario
  datosUsuario: any = null;

  // 2. Inyectamos el router en el constructor
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

  // 3. FIX ERROR 1: El HTML llama a user() como función
  user() {
    return this.datosUsuario;
  }

  // 4. FIX ERROR 2: El HTML busca la función logout() al hacer clic
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
