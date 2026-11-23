import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';

function setup(params: Record<string, string>) {
  TestBed.configureTestingModule({
    imports: [StudentFormComponent],
    providers: [
      provideHttpClient(),
      provideRouter([]),
      { provide: StudentService, useClass: StudentMockService },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params) } } },
    ]
  });
  const fixture: ComponentFixture<StudentFormComponent> = TestBed.createComponent(StudentFormComponent);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('StudentFormComponent', () => {
  it('should be in creation mode without id', () => {
    const component = setup({});
    expect(component.isEditMode).toBe(false);
    expect(component.studentForm.invalid).toBe(true);
  });

  it('should load the student in edition mode', () => {
    const component = setup({ id: '1' });
    expect(component.isEditMode).toBe(true);
    expect(component.studentForm.value.lastName).toBe('Lovelace');
  });
});
