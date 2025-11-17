export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
}