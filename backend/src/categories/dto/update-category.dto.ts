/**
 * ====================================================================
 * UPDATE-CATEGORY.DTO.TS - DTO PARA ACTUALIZAR CATEGORÍAS
 * ====================================================================
 * 
 * Este DTO se usa para actualizaciones parciales (PATCH).
 * Todos los campos del CreateCategoryDto se vuelven opcionales.
 * 
 * PATRÓN: DRY (Don't Repeat Yourself)
 * PartialType() evita duplicar código y mantiene las validaciones.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * UpdateCategoryDto hereda de CreateCategoryDto pero hace todos los campos opcionales
 * 
 * PartialType(CreateCategoryDto) genera automáticamente:
 * 
 * export class UpdateCategoryDto {
 *   @IsString()
 *   @IsOptional()  ← Agregado automáticamente
 *   nombre?: string;
 * 
 *   @IsString()
 *   @IsOptional()  ← Ya estaba, se mantiene
 *   descripcion?: string;
 * }
 * 
 * VENTAJAS:
 * 1. Menos código (DRY)
 * 2. Mantiene las validaciones de CreateCategoryDto
 * 3. Cambios en CreateCategoryDto se propagan automáticamente
 * 4. Todos los campos son opcionales (perfecto para PATCH)
 * 
 * ¿POR QUÉ PATCH Y NO PUT?
 * - PATCH: Actualización parcial (solo envías campos a cambiar)
 * - PUT: Reemplazo completo (envías todos los campos)
 * 
 * En esta API usamos PATCH porque es más flexible.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

/**
 * ====================================================================
 * EJEMPLOS DE USO
 * ====================================================================
 * 
 * 1️⃣ ACTUALIZAR SOLO EL NOMBRE:
 * PATCH /categories/1
 * 
 * {
 *   "nombre": "Electrónica y Tecnología"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Electrónica y Tecnología",  ← Actualizado
 *   "descripcion": "Productos electrónicos",  ← No cambió
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T12:00:00Z"  ← Actualizado automáticamente
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 2️⃣ ACTUALIZAR SOLO LA DESCRIPCIÓN:
 * PATCH /categories/1
 * 
 * {
 *   "descripcion": "Nueva descripción actualizada"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Electrónica y Tecnología",  ← No cambió
 *   "descripcion": "Nueva descripción actualizada",  ← Actualizado
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T12:30:00Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 3️⃣ ACTUALIZAR AMBOS CAMPOS:
 * PATCH /categories/1
 * 
 * {
 *   "nombre": "Tecnología",
 *   "descripcion": "Todo sobre tecnología moderna"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Tecnología",  ← Actualizado
 *   "descripcion": "Todo sobre tecnología moderna",  ← Actualizado
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T13:00:00Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 4️⃣ ERROR: NOMBRE DUPLICADO:
 * PATCH /categories/1
 * 
 * {
 *   "nombre": "Ropa"  ← Ya existe otra categoría con este nombre
 * }
 * 
 * Respuesta (409 Conflict):
 * {
 *   "statusCode": 409,
 *   "message": "Ya existe una categoría con ese nombre",
 *   "error": "Conflict"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 5️⃣ ERROR: NOMBRE VACÍO:
 * PATCH /categories/1
 * 
 * {
 *   "nombre": ""  ← Vacío
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *   "nombre should not be empty"
 *   ],
 *   "error": "Bad Request"
 * }
 */