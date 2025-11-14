/**
 * ====================================================================
 * CREATE-USER.DTO.TS - DATA TRANSFER OBJECT PARA CREAR USUARIOS
 * ====================================================================
 * 
 * Un DTO (Data Transfer Object) es un objeto que define cómo se deben
 * enviar los datos a través de la red.
 * 
 * PROPÓSITOS:
 * 1. VALIDACIÓN: Define qué datos son válidos (usando class-validator)
 * 2. DOCUMENTACIÓN: Sirve como contrato de la API
 * 3. SEGURIDAD: Solo permite campos específicos (whitelist)
 * 4. TIPADO: TypeScript sabe qué propiedades esperar
 * 
 * FLUJO:
 * Cliente envía JSON → NestJS valida contra DTO → Si válido, llama al Service
 *                      └───── Si inválido, devuelve 400 Bad Request
 */

import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

/**
 * CreateUserDto - Define los datos necesarios para crear un usuario
 * 
 * Este DTO se usa en el endpoint POST /users
 * Cada propiedad tiene decoradores de validación de class-validator
 */
export class CreateUserDto {
  /**
   * EMAIL - CORREO ELECTRÓNICO DEL USUARIO
   * ======================================
   * 
   * Validaciones:
   * 
   * @IsEmail({}, { message: ... }) - Valida que sea un email válido
   *   ✓ Válido: "usuario@example.com"
   *   ✗ Inválido: "no-es-email", "@example.com", "usuario@"
   * 
   * @IsNotEmpty({ message: ... }) - No puede estar vacío
   *   ✗ Inválido: "", null, undefined
   * 
   * Los mensajes personalizados se devuelven al cliente cuando falla
   * la validación, en lugar de los mensajes por defecto en inglés.
   * 
   * Ejemplo de request:
   * {
   *   "email": "juan@example.com",
   *   ...
   * }
   */
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  /**
   * PASSWORD - CONTRASEÑA DEL USUARIO
   * ==================================
   * 
   * Validaciones:
   * 
   * @IsString() - Debe ser un string
   *   ✗ Inválido: 123 (number), true (boolean), {} (object)
   * 
   * @MinLength(6, { message: ... }) - Mínimo 6 caracteres
   *   ✓ Válido: "abc123", "password123"
   *   ✗ Inválido: "12345" (solo 5 caracteres)
   * 
   * IMPORTANTE:
   * - Esta validación es ANTES de hashear la contraseña
   * - El Service se encarga de hashear con bcrypt
   * - El hash resultante siempre tiene 60 caracteres
   * 
   * MEJORAS OPCIONALES (agregar más seguridad):
   * @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
   *   message: 'Debe contener mayúscula, minúscula y número'
   * })
   * 
   * Ejemplo de request:
   * {
   *   "password": "password123",
   *   ...
   * }
   */
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  /**
   * NOMBRE - PRIMER NOMBRE DEL USUARIO
   * ====================================
   * 
   * Validaciones:
   * 
   * @IsString() - Debe ser un string
   * @IsNotEmpty({ message: ... }) - No puede estar vacío
   * 
   * MEJORAS OPCIONALES:
   * @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
   * @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
   * @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
   *   message: 'El nombre solo puede contener letras'
   * })
   * 
   * Ejemplo de request:
   * {
   *   "nombre": "Juan",
   *   ...
   * }
   */
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  /**
   * APELLIDO - APELLIDO DEL USUARIO
   * =================================
   * 
   * Validaciones:
   * 
   * @IsString() - Debe ser un string
   * @IsNotEmpty({ message: ... }) - No puede estar vacío
   * 
   * Mismas mejoras opcionales que el campo 'nombre'
   * 
   * Ejemplo de request:
   * {
   *   "apellido": "Pérez",
   *   ...
   * }
   */
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;
}

/**
 * ====================================================================
 * EJEMPLO COMPLETO DE REQUEST
 * ====================================================================
 * 
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
 * ====================================================================
 * RESPUESTAS POSIBLES
 * ====================================================================
 * 
 * ✓ ÉXITO (201 Created):
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
 * ✗ ERROR DE VALIDACIÓN (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "El email debe ser válido",
 *     "La contraseña debe tener al menos 6 caracteres"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * ✗ EMAIL DUPLICADO (409 Conflict):
 * {
 *   "statusCode": 409,
 *   "message": "El correo ya está registrado",
 *   "error": "Conflict"
 * }
 */

/**
 * ====================================================================
 * 📚 CONCEPTOS DE CLASS-VALIDATOR
 * ====================================================================
 * 
 * DECORADORES DE VALIDACIÓN COMUNES:
 * 
 * 1. STRINGS:
 *    @IsString() - Es un string
 *    @IsNotEmpty() - No está vacío
 *    @MinLength(n) - Mínimo n caracteres
 *    @MaxLength(n) - Máximo n caracteres
 *    @Matches(regex) - Cumple con la expresión regular
 *    @IsAlpha() - Solo letras
 *    @IsAlphanumeric() - Solo letras y números
 * 
 * 2. EMAILS Y URLs:
 *    @IsEmail() - Email válido
 *    @IsUrl() - URL válida
 * 
 * 3. NÚMEROS:
 *    @IsNumber() - Es un número
 *    @IsInt() - Es un entero
 *    @Min(n) - Mínimo valor n
 *    @Max(n) - Máximo valor n
 *    @IsPositive() - Es positivo
 * 
 * 4. BOOLEANOS:
 *    @IsBoolean() - Es un boolean
 * 
 * 5. FECHAS:
 *    @IsDate() - Es una fecha
 *    @MinDate(date) - Fecha mínima
 *    @MaxDate(date) - Fecha máxima
 * 
 * 6. ARRAYS:
 *    @IsArray() - Es un array
 *    @ArrayMinSize(n) - Mínimo n elementos
 *    @ArrayMaxSize(n) - Máximo n elementos
 * 
 * 7. OPCIONALES:
 *    @IsOptional() - El campo es opcional (puede no existir)
 * 
 * CONFIGURACIÓN GLOBAL (en main.ts):
 * app.useGlobalPipes(new ValidationPipe({
 *   whitelist: true,              // Elimina propiedades no definidas
 *   forbidNonWhitelisted: true,   // Error si hay propiedades extra
 *   transform: true,              // Transforma tipos automáticamente
 * }));
 * 
 * PERSONALIZACIÓN DE MENSAJES:
 * Cada decorador acepta un objeto de opciones con 'message':
 * @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
 */