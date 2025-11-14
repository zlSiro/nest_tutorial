/**
 * ====================================================================
 * USERS.CONTROLLER.TS - CONTROLADOR DE RUTAS DE USUARIOS
 * ====================================================================
 * 
 * El controlador es la "puerta de entrada" de las peticiones HTTP.
 * Maneja las rutas (endpoints) y delega la lógica de negocio al Service.
 * 
 * RESPONSABILIDADES:
 * - Definir las rutas HTTP (GET, POST, PATCH, DELETE)
 * - Validar y extraer parámetros de la request
 * - Llamar al servicio correspondiente
 * - Devolver la respuesta HTTP con el código de estado correcto
 * 
 * ❌ NO DEBE: Contener lógica de negocio (eso va en el Service)
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Decorador @Controller - Define el prefijo de ruta base
 * 
 * @Controller('users') → Todas las rutas comenzarán con /users
 * Ejemplos: /users, /users/123, /users/search, etc.
 */
@Controller('users')
export class UsersController {
  /**
   * INYECCIÓN DE DEPENDENCIAS
   * 
   * El constructor recibe el UsersService mediante inyección de dependencias.
   * 
   * ¿Qué significa esto?
   * - NestJS crea automáticamente una instancia de UsersService
   * - La inyecta en el constructor (no tenemos que hacer 'new UsersService()')
   * - readonly: No podemos reasignar usersService después de la inicialización
   * - private: Solo accesible dentro de esta clase
   * 
   * Beneficios:
   * - Código más limpio y testeable
   * - Desacoplamiento (el controller no sabe cómo se crea el service)
   * - Facilita el testing (podemos inyectar mocks)
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * ================================================================
   * 📝 ENDPOINT: CREAR USUARIO
   * ================================================================
   * 
   * @Post() - Define que este método maneja peticiones POST
   * Ruta completa: POST /users
   * 
   * @HttpCode(HttpStatus.CREATED) - Devuelve código 201 (Created)
   * Por defecto POST devuelve 200, pero 201 es más semántico para creación
   * 
   * @Body() - Extrae el cuerpo de la request y lo valida contra CreateUserDto
   * NestJS automáticamente:
   * 1. Parsea el JSON del body
   * 2. Valida usando class-validator (decoradores del DTO)
   * 3. Si es inválido, devuelve 400 Bad Request con los errores
   * 4. Si es válido, pasa el objeto al método
   * 
   * EJEMPLO DE REQUEST:
   * POST http://localhost:3000/users
   * Content-Type: application/json
   * 
   * {
   *   "email": "juan@example.com",
   *   "password": "password123",
   *   "nombre": "Juan",
   *   "apellido": "Pérez"
   * }
   * 
   * RESPUESTA EXITOSA: 201 Created
   * {
   *   "id": 1,
   *   "email": "juan@example.com",
   *   "nombre": "Juan",
   *   "apellido": "Pérez",
   *   "isActive": true,
   *   "createdAt": "2025-11-14T10:30:00.000Z",
   *   "updatedAt": "2025-11-14T10:30:00.000Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * ================================================================
   * 📋 ENDPOINT: LISTAR TODOS LOS USUARIOS
   * ================================================================
   * 
   * @Get() - Define que este método maneja peticiones GET
   * Ruta completa: GET /users
   * 
   * No recibe parámetros, devuelve todos los usuarios activos
   * 
   * EJEMPLO DE REQUEST:
   * GET http://localhost:3000/users
   * 
   * RESPUESTA EXITOSA: 200 OK
   * [
   *   {
   *     "id": 1,
   *     "email": "juan@example.com",
   *     "nombre": "Juan",
   *     "apellido": "Pérez",
   *     "isActive": true,
   *     "createdAt": "2025-11-14T10:30:00.000Z",
   *     "updatedAt": "2025-11-14T10:30:00.000Z"
   *   },
   *   {
   *     "id": 2,
   *     "email": "maria@example.com",
   *     "nombre": "María",
   *     "apellido": "García",
   *     "isActive": true,
   *     "createdAt": "2025-11-14T11:00:00.000Z",
   *     "updatedAt": "2025-11-14T11:00:00.000Z"
   *   }
   * ]
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * ================================================================
   * 🔍 ENDPOINT: BUSCAR UN USUARIO POR ID
   * ================================================================
   * 
   * @Get(':id') - Ruta dinámica con parámetro 'id'
   * Ruta completa: GET /users/:id
   * 
   * @Param('id', ParseIntPipe) - Extrae el parámetro 'id' de la URL
   * ParseIntPipe:
   * - Convierte automáticamente el string a number
   * - Si no es un número válido, devuelve 400 Bad Request
   * 
   * Ejemplos:
   * - GET /users/5 → id = 5 (válido)
   * - GET /users/abc → 400 Bad Request (inválido)
   * 
   * EJEMPLO DE REQUEST:
   * GET http://localhost:3000/users/1
   * 
   * RESPUESTA EXITOSA: 200 OK
   * {
   *   "id": 1,
   *   "email": "juan@example.com",
   *   "nombre": "Juan",
   *   "apellido": "Pérez",
   *   "isActive": true,
   *   "createdAt": "2025-11-14T10:30:00.000Z",
   *   "updatedAt": "2025-11-14T10:30:00.000Z"
   * }
   * 
   * RESPUESTA DE ERROR: 404 Not Found
   * {
   *   "statusCode": 404,
   *   "message": "Usuario con ID 999 no encontrado"
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * ================================================================
   * ✏️ ENDPOINT: ACTUALIZAR UN USUARIO
   * ================================================================
   * 
   * @Patch(':id') - Actualización parcial (PATCH vs PUT)
   * - PATCH: Actualiza solo los campos enviados
   * - PUT: Reemplaza el recurso completo
   * 
   * Ruta completa: PATCH /users/:id
   * 
   * Recibe:
   * - @Param('id'): ID del usuario a actualizar
   * - @Body(): Campos a actualizar (todos opcionales gracias a PartialType)
   * 
   * EJEMPLO DE REQUEST:
   * PATCH http://localhost:3000/users/1
   * Content-Type: application/json
   * 
   * {
   *   "nombre": "Juan Carlos"
   * }
   * 
   * RESPUESTA EXITOSA: 200 OK
   * {
   *   "id": 1,
   *   "email": "juan@example.com",
   *   "nombre": "Juan Carlos",  ← Campo actualizado
   *   "apellido": "Pérez",
   *   "isActive": true,
   *   "createdAt": "2025-11-14T10:30:00.000Z",
   *   "updatedAt": "2025-11-14T12:00:00.000Z"  ← Timestamp actualizado
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * ================================================================
   * 🗑️ ENDPOINT: ELIMINAR UN USUARIO (SOFT DELETE)
   * ================================================================
   * 
   * @Delete(':id') - Define que este método maneja peticiones DELETE
   * Ruta completa: DELETE /users/:id
   * 
   * @HttpCode(HttpStatus.NO_CONTENT) - Devuelve código 204 (No Content)
   * - 204 indica que la operación fue exitosa pero no hay contenido que devolver
   * - Es el código estándar para deletes exitosos
   * 
   * IMPORTANTE: Este endpoint hace SOFT DELETE, no elimina físicamente
   * - Solo marca isActive = false
   * - Los datos permanecen en la BD para auditoría
   * 
   * EJEMPLO DE REQUEST:
   * DELETE http://localhost:3000/users/1
   * 
   * RESPUESTA EXITOSA: 204 No Content
   * (Sin cuerpo de respuesta)
   * 
   * RESPUESTA DE ERROR: 404 Not Found
   * {
   *   "statusCode": 404,
   *   "message": "Usuario con ID 999 no encontrado"
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS CLAVE
 * ====================================================================
 * 
 * 1. SEPARACIÓN DE RESPONSABILIDADES:
 *    - Controller: Maneja HTTP (rutas, requests, responses)
 *    - Service: Contiene la lógica de negocio
 *    - Repository: Interactúa con la base de datos
 * 
 * 2. CÓDIGOS HTTP COMUNES:
 *    - 200 OK: Operación exitosa (GET, PATCH)
 *    - 201 Created: Recurso creado exitosamente (POST)
 *    - 204 No Content: Operación exitosa sin contenido (DELETE)
 *    - 400 Bad Request: Datos inválidos
 *    - 404 Not Found: Recurso no encontrado
 *    - 409 Conflict: Conflicto (ej: email duplicado)
 *    - 500 Internal Server Error: Error del servidor
 * 
 * 3. DECORADORES IMPORTANTES:
 *    - @Controller(): Define el controlador y su ruta base
 *    - @Get(), @Post(), @Patch(), @Delete(): Métodos HTTP
 *    - @Body(): Extrae el cuerpo de la request
 *    - @Param(): Extrae parámetros de la URL
 *    - @Query(): Extrae query params (?page=1&limit=10)
 *    - @HttpCode(): Define el código de respuesta HTTP
 * 
 * 4. PIPES:
 *    - ParseIntPipe: Convierte string a number
 *    - ValidationPipe: Valida DTOs (configurado globalmente)
 *    - ParseBoolPipe, ParseArrayPipe, etc.
 */
