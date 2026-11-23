import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { StudentRequest } from '../../../core/models/StudentRequest';
import { getErrorMessage } from '../../../core/utils/error-message';

/**
 * Formulaire partagé entre la création (/students/new) et la modification (/students/:id/edit).
 */
@Component({
  selector: 'app-student-form',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-form.component.html',
  standalone: true
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  studentForm: FormGroup = new FormGroup({});
  studentId: number | null = null;
  submitted = false;
  loading = false;
  errorMessage: string | null = null;
  readonly today = new Date().toISOString().split('T')[0];

  get isEditMode(): boolean {
    return this.studentId !== null;
  }

  get form() {
    return this.studentForm.controls;
  }

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = Number(id);
      this.loading = true;
      this.studentService.getById(this.studentId)
        .pipe(
          finalize(() => this.loading = false),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: student => this.studentForm.patchValue(student),
          error: (error: HttpErrorResponse) =>
            this.errorMessage = getErrorMessage(error, 'Impossible de charger cet étudiant.')
        });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    if (this.studentForm.invalid) {
      return;
    }
    const student: StudentRequest = {
      firstName: this.form['firstName'].value,
      lastName: this.form['lastName'].value,
      email: this.form['email'].value,
      birthDate: this.form['birthDate'].value
    };
    const request$: Observable<Student> = this.isEditMode
      ? this.studentService.update(this.studentId!, student)
      : this.studentService.create(student);

    this.loading = true;
    request$
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: saved => this.router.navigate(['/students', saved.id]),
        error: (error: HttpErrorResponse) =>
          this.errorMessage = getErrorMessage(error, 'Impossible d\'enregistrer cet étudiant.')
      });
  }
}
