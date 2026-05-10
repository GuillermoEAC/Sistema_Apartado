import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = '';
  isSubmitting = false;

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos correctamente.';
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .login({ correo: correo ?? '', password: password ?? '' })
      .subscribe({
        next: () => {
          // Redirect based on role
          const role = this.authService.userRole();
          if (role === 'admin') {
            this.router.navigateByUrl('/admin/dashboard');
          } else {
            this.router.navigateByUrl('/app/dashboard');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message ?? 'Credenciales inválidas. Verifica tu correo y contraseña.';
        },
      });
  }
}