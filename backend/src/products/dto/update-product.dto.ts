/**
 * ====================================================================
 * UPDATE-PRODUCT.DTO.TS - DTO PARA ACTUALIZAR PRODUCTOS
 * ====================================================================
 * 
 * Igual que UpdateCategoryDto, este DTO usa PartialType
 * para hacer opcionales todos los campos de CreateProductDto.
 * 
 * Esto permite actualizaciones parciales (PATCH):
 * - Puedes actualizar solo el precio
 * - O solo el stock
 * - O cualquier combinación de campos
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * UpdateProductDto - DTO para actualizaciones parciales
 * 
 * PartialType(CreateProductDto) genera:
 * 
 * export class UpdateProductDto {
 *   @IsString()
 *   @IsOptional()  ← Agregado automáticamente
 *   nombre?: string;
 * 
 *   @IsString()
 *   @IsOptional()  ← Ya estaba, se mantiene
 *   descripcion?: string;
 * 
 *   @IsNumber({ maxDecimalPlaces: 2 })
 *   @IsPositive()
 *   @IsOptional()  ← Agregado automáticamente
 *   precio?: number;
 * 
 *   @IsInt()
 *   @Min(0)
 *   @IsOptional()  ← Agregado automáticamente
 *   stock?: number;
 * 
 *   @IsString()
 *   @IsOptional()  ← Ya estaba, se mantiene
 *   imageUrl?: string;
 * 
 *   @IsInt()
 *   @IsPositive()
 *   @IsOptional()  ← Agregado automáticamente
 *   categoryId?: number;
 * }
 * 
 * IMPORTANTE:
 * Las validaciones de CreateProductDto se mantienen.
 * Si envías "precio", debe seguir siendo positivo con máx 2 decimales.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}

/**
 * ====================================================================
 * EJEMPLOS DE USO
 * ====================================================================
 * 
 * 1️⃣ ACTUALIZAR SOLO EL PRECIO:
 * PATCH /products/1
 * 
 * {
 *   "precio": 1199.99
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Laptop HP Pavilion",  ← No cambió
 *   "descripcion": "Laptop con procesador Intel Core i7",  ← No cambió
 *   "precio": "1199.99",  ← Actualizado
 *   "stock": 15,  ← No cambió
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",  ← No cambió
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T12:00:00Z",  ← Actualizado automáticamente
 *   "category": {
 *     "id": 1,
 *     "nombre": "Electrónica",
 *     "descripcion": "Productos electrónicos",
 *     "isActive": true
 *   }
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 2️⃣ ACTUALIZAR STOCK (útil cuando hay ventas):
 * PATCH /products/1
 * 
 * {
 *   "stock": 10
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Laptop HP Pavilion",
 *   "descripcion": "Laptop con procesador Intel Core i7",
 *   "precio": "1199.99",
 *   "stock": 10,  ← Actualizado (era 15)
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T12:30:00Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 3️⃣ ACTUALIZAR MÚLTIPLES CAMPOS:
 * PATCH /products/1
 * 
 * {
 *   "nombre": "Laptop HP Pavilion 2024",
 *   "precio": 1399.99,
 *   "stock": 20,
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp-2024.jpg"
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Laptop HP Pavilion 2024",  ← Actualizado
 *   "descripcion": "Laptop con procesador Intel Core i7",  ← No cambió
 *   "precio": "1399.99",  ← Actualizado
 *   "stock": 20,  ← Actualizado
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp-2024.jpg",  ← Actualizado
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00Z",
 *   "updatedAt": "2025-11-17T13:00:00Z"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 4️⃣ CAMBIAR CATEGORÍA DEL PRODUCTO:
 * PATCH /products/1
 * 
 * {
 *   "categoryId": 2
 * }
 * 
 * Respuesta (200 OK):
 * {
 *   "id": 1,
 *   "nombre": "Laptop HP Pavilion 2024",
 *   "precio": "1399.99",
 *   "stock": 20,
 *   "category": {  ← Nueva categoría
 *     "id": 2,
 *     "nombre": "Computadoras",
 *     "descripcion": "Laptops y desktops",
 *     "isActive": true
 *   }
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 5️⃣ ERROR: PRECIO INVÁLIDO (más de 2 decimales):
 * PATCH /products/1
 * 
 * {
 *   "precio": 1199.999  ← 3 decimales
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "precio must be a number conforming to the specified constraints"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 6️⃣ ERROR: STOCK NEGATIVO:
 * PATCH /products/1
 * 
 * {
 *   "stock": -5
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "stock must not be less than 0"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 7️⃣ ERROR: CATEGORÍA NO EXISTE:
 * PATCH /products/1
 * 
 * {
 *   "categoryId": 999
 * }
 * 
 * Respuesta (404 Not Found):
 * {
 *   "statusCode": 404,
 *   "message": "Categoría no encontrada",
 *   "error": "Not Found"
 * }
 */

/**
 * ====================================================================
 * 📚 CASO DE USO: GESTIÓN DE INVENTARIO
 * ====================================================================
 * 
 * Imagina un sistema de e-commerce:
 * 
 * 1. RECIBIR INVENTARIO:
 *    PATCH /products/1
 *    { "stock": 50 }  ← Actualizar solo stock
 * 
 * 2. CAMBIAR PRECIO (OFERTA):
 *    PATCH /products/1
 *    { "precio": 999.99 }  ← Precio de oferta
 * 
 * 3. MOVER A OTRA CATEGORÍA:
 *    PATCH /products/1
 *    { "categoryId": 3 }  ← Nueva categoría "Ofertas"
 * 
 * 4. MARCAR COMO AGOTADO:
 *    PATCH /products/1
 *    { "stock": 0 }  ← Sin stock
 * 
 * 5. ACTUALIZAR TODO (NUEVO MODELO):
 *    PATCH /products/1
 *    {
 *      "nombre": "Laptop HP Pavilion 2025",
 *      "descripcion": "Nueva generación con IA",
 *      "precio": 1499.99,
 *      "stock": 30,
 *      "imageUrl": "https://cdn.tienda.com/hp-2025.jpg",
 *      "categoryId": 1
 *    }
 * 
 * La flexibilidad de PATCH permite actualizar solo
 * lo necesario sin enviar todos los campos.
 */