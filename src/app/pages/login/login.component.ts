import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessage: string | null = null;
  success = false;

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.success = false;
    if (this.loginForm.invalid) {
      return;
    }
    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.loading = true;
    this.userService.login(credentials)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.success = true;
          // TODO (étape 5) : rediriger vers la liste des étudiants
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message ?? 'Erreur lors de la connexion. Veuillez réessayer.';
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.success = false;
    this.loginForm.reset();
  }
}
