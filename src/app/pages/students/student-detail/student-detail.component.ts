import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { getErrorMessage } from '../../../core/utils/error-message';

@Component({
  selector: 'app-student-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-detail.component.html',
  standalone: true
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  student: Student | null = null;
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.studentService.getById(id)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: student => this.student = student,
        error: (error: HttpErrorResponse) =>
          this.errorMessage = getErrorMessage(error, 'Impossible de charger cet étudiant.')
      });
  }

  onDelete(): void {
    if (!this.student || !confirm(`Supprimer ${this.student.firstName} ${this.student.lastName} ?`)) {
      return;
    }
    this.studentService.delete(this.student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/students']),
        error: (error: HttpErrorResponse) =>
          this.errorMessage = getErrorMessage(error, 'Impossible de supprimer cet étudiant.')
      });
  }
}
