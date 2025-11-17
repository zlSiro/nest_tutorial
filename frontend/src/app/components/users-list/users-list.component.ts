import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UsersService } from '../../services/users.service';
import { UserFormComponent } from "../user-form/user-form.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [UserFormComponent, CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  showForm: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        console.error(err);
      }
    })
  }

  onAddUser(): void {
    this.selectedUser = null;
    this.showForm = true;
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.showForm = true;
  }

  onDeleteUser(id: number): void {
    if (confirm('Estás seguro de eliminar este usuario?')) {
      this.usersService.delete(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.error = 'Error al eliminar usuario';
          console.error(err);
        }
      });
    }
  }

  onFormSubmit(): void {
    this.showForm = false;
    this.selectedUser = null;
    this.loadUsers();
  }

  onFormCancel(): void {
    this.showForm = false;
    this.selectedUser = null;
  }
}
