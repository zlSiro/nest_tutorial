import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'], 
})
export class UserFormComponent {

  @Input() user: User | null = null;
  @Input() submitForm = new EventEmitter<void>();
  @Input() cancelForm = new EventEmitter<void>();

  userForm: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.isEditMode = true;
      this.userForm.patchValue({
        email: this.user.email,
        nombre: this.user.nombre,
        apellido: this.user.apellido
      });
      // En modo edición, la contraseña es opcional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.userForm.value;

    // Si estamos editando y no se cambio la contraseña, no la enviamos
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    const request = this.isEditMode
      ? this.usersService.update(this.user!.id, formData)
      : this.usersService.create(formData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.submitForm.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar el usuario';
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  // Helper para mostrar errores de validación
  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('email')) {
      return ' Email inválido';
    }

    if (field?.hasError('minlength')) {
      return `Minimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}
