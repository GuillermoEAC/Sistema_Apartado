import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {

  nombreUsuario: string = 'Usuario';

  ngOnInit(): void {
    const sesion = localStorage.getItem('usuario') || localStorage.getItem('user');

    if (sesion) {
      const datosUsuario = JSON.parse(sesion);
      this.nombreUsuario = datosUsuario.nombre || datosUsuario.name || 'Usuario';
    }
  }

}