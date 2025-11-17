/**
 * ====================================================================
 * CREATE-CATEGORY.DTO.TS - DTO PARA CREAR CATEGORÍAS
 * ====================================================================
 * 
 * Este DTO define los datos necesarios para crear una nueva categoría.
 * Es más simple que el de usuarios porque tiene menos campos y validaciones.
 * 
 * CAMPOS:
 * - nombre: Obligatorio, string
 * - descripción: Opcional, string
 */

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * CreateCategoryDto - Datos para crear una categoría
 * 
 * Este DTO se usa en: POST /categories
 */
export class CreateCategoryDto {
  /**
   * NOMBRE - NOMBRE DE LA CATEGORÍA
   * ================================
   * 
   * Validaciones:
   * 
   * @IsString() - Debe ser un string
   * @IsNotEmpty() - No puede estar vacío
   * 
   * Ejemplos válidos:
   * ✓ "Electrónica"
   * ✓ "Ropa y Accesorios"
   * ✓ "Alimentos"
   * 
   * Ejemplos inválidos:
   * ✗ "" (vacío)
   * ✗ null
   * ✗ undefined
   * ✗ 123 (no es string)
   * 
   * MEJORAS OPCIONALES:
   * @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
   * @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
   * @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/, {
   *   message: 'El nombre solo puede contener letras y espacios'
   * })
   */
  @IsString()
  @IsNotEmpty()
  nombre: string;

  /**
   * DESCRIPCIÓN - DESCRIPCIÓN DE LA CATEGORÍA (OPCIONAL)
   * ========================================================
   * 
   * Validaciones:
   * 
   * @IsString() - Debe ser un string (si se proporciona)
   * @IsOptional() - Este campo es OPCIONAL
   * 
   * ¿QUÉ HACE @IsOptional()?
   * - El campo puede no estar presente en el JSON
   * - Si está presente, debe cumplir las otras validaciones
   * - Si no está, NO se valida (es válido)
   * 
   * Ejemplos válidos:
   * ✓ "Productos electrónicos y tecnología"
   * ✓ "" (string vacío es válido porque @IsOptional)
   * ✓ undefined (no presente en el JSON)
   * ✓ null
   * 
   * Ejemplos inválidos:
   * ✗ 123 (no es string)
   * ✗ { texto: "algo" } (no es string)
   * 
   * NOTA:
   * Si quieres que NO pueda ser un string vacío cuando se envía:
   * @IsOptional()
   * @IsString()
   * @MinLength(1, { message: 'Si proporcionas descripción, no puede estar vacía' })
   */
  @IsString()
  @IsOptional()
  descripcion?: string;
}

/**
 * ====================================================================
 * EJEMPLOS DE REQUESTS
 * ====================================================================
 * 
 * 1️⃣ CREAR CATEGORÍA CON DESCRIPCIÓN:
 * POST /categories
 * Content-Type: application/json
 * 
 * {
 *   "nombre": "Electrónica",
 *   "descripcion": "Productos electrónicos y tecnológicos"
 * }
 * 
 * Respuesta (201 Created):
 * {
 *   "id": 1,
 *   "nombre": "Electrónica",
 *   "descripcion": "Productos electrónicos y tecnológicos",
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00.000Z",
 *   "updatedAt": "2025-11-17T10:00:00.000Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 2️⃣ CREAR CATEGORÍA SIN DESCRIPCIÓN (Válido):
 * POST /categories
 * 
 * {
 *   "nombre": "Ropa"
 * }
 * 
 * Respuesta (201 Created):
 * {
 *   "id": 2,
 *   "nombre": "Ropa",
 *   "descripcion": null,
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:05:00.000Z",
 *   "updatedAt": "2025-11-17T10:05:00.000Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 3️⃣ ERROR: NOMBRE VACÍO:
 * POST /categories
 * 
 * {
 *   "nombre": "",
 *   "descripcion": "Alguna descripción"
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "nombre should not be empty"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 4️⃣ ERROR: NOMBRE DUPLICADO:
 * POST /categories
 * 
 * {
 *   "nombre": "Electrónica"  // Ya existe
 * }
 * 
 * Respuesta (409 Conflict):
 * {
 *   "statusCode": 409,
 *   "message": "Ya existe una categoría con ese nombre",
 *   "error": "Conflict"
 * }
 */

/**
 * ====================================================================
 * 📚 CONCEPTOS: CAMPOS OPCIONALES
 * ====================================================================
 * 
 * 1. @IsOptional() VS CAMPOS REQUERIDOS:
 *    
 *    SIN @IsOptional() (campo obligatorio):
 *    @IsString()
 *    @IsNotEmpty()
 *    nombre: string;
 *    
 *    → El campo DEBE estar en el JSON
 *    → NO puede ser null, undefined o vacío
 *    
 *    CON @IsOptional() (campo opcional):
 *    @IsString()
 *    @IsOptional()
 *    descripcion?: string;
 *    
 *    → El campo PUEDE NO estar en el JSON
 *    → Si está, debe ser string
 *    → Usar "?" en TypeScript para indicar opcional
 * 
 * 2. ORDEN DE DECORADORES:
 *    El orden importa para legibilidad, usa:
 *    1. Validadores de tipo (@IsString, @IsNumber, etc.)
 *    2. Validadores de contenido (@MinLength, @Min, etc.)
 *    3. @IsOptional al final
 * 
 * 3. DIFERENCIA CON NULLABLE EN ENTITY:
 *    
 *    DTO: @IsOptional() → El campo puede no enviarse
 *    Entity: nullable: true → La BD acepta NULL
 *    
 *    Son independientes:
 *    - DTO valida la entrada del cliente
 *    - Entity define la estructura de la BD
 * 
 * 4. VALIDACIÓN CONDICIONAL:
 *    Si quieres validar solo cuando esté presente:
 *    
 *    @IsOptional()
 *    @MinLength(10)
 *    descripcion?: string;
 *    
 *    → Si no envías descripcion: OK
 *    → Si envías "hola": ERROR (menos de 10 caracteres)
 *    → Si envías "descripción larga": OK
 */