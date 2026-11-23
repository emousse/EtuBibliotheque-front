import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StudentService } from '../../../core/service/student.service';
import { UserService } from '../../../core/service/user.service';
import { Student } from '../../../core/models/Student';
import { getErrorMessage } from '../../../core/utils/error-message';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-list.component.html',
  standalone: true
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  students: Student[] = [];
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.studentService.getAll()
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: students => this.students = students,
        error: (error: HttpErrorResponse) =>
          this.errorMessage = getErrorMessage(error, 'Impossible de charger les étudiants.')
      });
  }

  onDelete(student: Student): void {
    if (!confirm(`Supprimer ${student.firstName} ${student.lastName} ?`)) {
      return;
    }
    this.errorMessage = null;
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.students = this.students.filter(s => s.id !== student.id),
        error: (error: HttpErrorResponse) =>
          this.errorMessage = getErrorMessage(error, 'Impossible de supprimer cet étudiant.')
      });
  }

  onLogout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
