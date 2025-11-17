import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserDto, UpdateUserDto, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  // obtener todos los usuarios
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // obtener un usuario por ID
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo usuario
  create(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // Actualizar un usuario existente
  update(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  // Eliminar un usuario
  delete(id:number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
