/**
 * ====================================================================
 * UPDATE-USER.DTO.TS - DATA TRANSFER OBJECT PARA ACTUALIZAR USUARIOS
 * ====================================================================
 * 
 * Este DTO se usa para el endpoint PATCH /users/:id
 * 
 * DIFERENCIA CLAVE CON CreateUserDto:
 * - CreateUserDto: Todos los campos son REQUERIDOS
 * - UpdateUserDto: Todos los campos son OPCIONALES
 * 
 * ¿Por qué? Porque en una actualización (PATCH), el cliente solo
 * envía los campos que quiere modificar, no todos los campos.
 * 
 * PATRÓN: DRY (Don't Repeat Yourself)
 * En lugar de copiar y pegar todas las propiedades de CreateUserDto
 * y marcarlas como opcionales, usamos PartialType() que lo hace automáticamente.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto extiende CreateUserDto pero hace todos los campos opcionales
 * 
 * PartialType(CreateUserDto) es equivalente a:
 * 
 * export class UpdateUserDto {
 *   @IsEmail()
 *   @IsOptional()  ← Agregado automáticamente
 *   email?: string;
 * 
 *   @IsString()
 *   @MinLength(6)
 *   @IsOptional()  ← Agregado automáticamente
 *   password?: string;
 * 
 *   @IsString()
 *   @IsOptional()  ← Agregado automáticamente
 *   nombre?: string;
 * 
 *   @IsString()
 *   @IsOptional()  ← Agregado automáticamente
 *   apellido?: string;
 * }
 * 
 * Ventajas:
 * 1. Menos código (DRY)
 * 2. Mantiene las validaciones de CreateUserDto
 * 3. Si agregas un campo a CreateUserDto, automáticamente
 *    está disponible (y opcional) en UpdateUserDto
 * 4. Cambios en validaciones se propagan automáticamente
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}

/**
 * ====================================================================
 * EJEMPLOS DE USO
 * ====================================================================
 * 
 * 1. ACTUALIZAR SOLO EL NOMBRE:
 * PATCH http://localhost:3000/users/1
 * Content-Type: application/json
 * 
 * {
 *   "nombre": "Juan Carlos"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "email": "juan@example.com",         ← No cambió
 *   "nombre": "Juan Carlos",              ← Actualizado
 *   "apellido": "Pérez",                 ← No cambió
 *   "isActive": true,
 *   "createdAt": "2025-11-14T10:30:00Z",
 *   "updatedAt": "2025-11-14T15:00:00Z"  ← Actualizado automáticamente
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 2. ACTUALIZAR MÚTIPLES CAMPOS:
 * PATCH http://localhost:3000/users/1
 * Content-Type: application/json
 * 
 * {
 *   "email": "juan.carlos@example.com",
 *   "password": "newpassword123"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "email": "juan.carlos@example.com",  ← Actualizado
 *   "nombre": "Juan Carlos",              ← No cambió
 *   "apellido": "Pérez",                 ← No cambió
 *   "isActive": true,
 *   "createdAt": "2025-11-14T10:30:00Z",
 *   "updatedAt": "2025-11-14T16:00:00Z"  ← Actualizado
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 3. ERROR DE VALIDACIÓN (password muy corto):
 * PATCH http://localhost:3000/users/1
 * Content-Type: application/json
 * 
 * {
 *   "password": "123"  ← Solo 3 caracteres (mínimo es 6)
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "password must be longer than or equal to 6 characters"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 4. ERROR DE CONFLICTO (email ya existe):
 * PATCH http://localhost:3000/users/1
 * Content-Type: application/json
 * 
 * {
 *   "email": "maria@example.com"  ← Ya usado por otro usuario
 * }
 * 
 * Respuesta (409 Conflict):
 * {
 *   "statusCode": 409,
 *   "message": "El correo ya está registrado",
 *   "error": "Conflict"
 * }
 */

/**
 * ====================================================================
 * 📚 CONCEPTOS DE @nestjs/mapped-types
 * ====================================================================
 * 
 * MAPPED TYPES - Utilidades para transformar DTOs:
 * 
 * 1. PartialType(BaseDto)
 *    Hace todos los campos opcionales
 *    Uso: DTOs de actualización (PATCH)
 * 
 * 2. PickType(BaseDto, ['field1', 'field2'])
 *    Selecciona solo algunos campos
 *    Ejemplo: Solo email y password para login
 * 
 * 3. OmitType(BaseDto, ['field1', 'field2'])
 *    Excluye algunos campos
 *    Ejemplo: Todo excepto password para responses
 * 
 * 4. IntersectionType(Dto1, Dto2)
 *    Combina dos DTOs
 *    Ejemplo: Merge CreateUserDto y CreateProfileDto
 * 
 * INSTALACIÓN:
 * npm install @nestjs/mapped-types
 * 
 * Para usar con Swagger (documentación API):
 * npm install @nestjs/swagger
 * Luego usa: import { PartialType } from '@nestjs/swagger';
 * 
 * PATCH vs PUT:
 * - PATCH: Actualización parcial (usa PartialType)
 * - PUT: Reemplazo completo (usa el DTO original completo)
 * 
 * En esta API usamos PATCH porque es más flexible y común.
 */