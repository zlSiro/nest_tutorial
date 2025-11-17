/**
 * ====================================================================
 * CREATE-PRODUCT.DTO.TS - DTO PARA CREAR PRODUCTOS
 * ====================================================================
 * 
 * Este DTO es más complejo que el de categorías porque:
 * 1. Maneja validaciones numéricas (precio, stock)
 * 2. Gestiona relaciones (categoryId)
 * 3. Tiene campos opcionales (descripción, imageUrl)
 * 
 * CAMPOS:
 * - nombre: Obligatorio, string
 * - descripcion: Opcional, string
 * - precio: Obligatorio, number con máximo 2 decimales, positivo
 * - stock: Obligatorio, integer, mínimo 0
 * - imageUrl: Opcional, string
 * - categoryId: Obligatorio, integer, positivo (FK a categories)
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsInt,
} from 'class-validator';

/**
 * CreateProductDto - Datos para crear un producto
 * 
 * Se usa en: POST /products
 */
export class CreateProductDto {
  /**
   * NOMBRE - NOMBRE DEL PRODUCTO
   * ==============================
   * 
   * Validaciones:
   * @IsString() - Debe ser un string
   * @IsNotEmpty() - No puede estar vacío
   * 
   * Ejemplos válidos:
   * ✓ "Laptop HP Pavilion"
   * ✓ "Mouse Logitech G502"
   * ✓ "Monitor LG 27 pulgadas"
   * 
   * Ejemplos inválidos:
   * ✗ "" (vacío)
   * ✗ null
   * ✗ 123 (no es string)
   */
  @IsString()
  @IsNotEmpty()
  nombre: string;

  /**
   * DESCRIPCIÓN - DESCRIPCIÓN DEL PRODUCTO (OPCIONAL)
   * ==================================================
   * 
   * Validaciones:
   * @IsString() - Debe ser string si se proporciona
   * @IsOptional() - Campo opcional
   * 
   * Ejemplos válidos:
   * ✓ "Laptop con procesador Intel Core i7"
   * ✓ undefined (no enviado)
   * ✓ null
   * 
   * Ejemplos inválidos:
   * ✗ 123 (no es string)
   */
  @IsString()
  @IsOptional()
  descripcion?: string;

  /**
   * PRECIO - PRECIO DEL PRODUCTO
   * ==============================
   * 
   * Validaciones:
   * 
   * @IsNumber({ maxDecimalPlaces: 2 })
   * ↳ Debe ser un número con máximo 2 decimales
   * ↳ Perfecto para precios en formato XX.XX
   * 
   * @IsPositive()
   * ↳ Debe ser mayor a 0
   * ↳ No acepta 0 ni números negativos
   * 
   * ¿POR QUÉ maxDecimalPlaces: 2?
   * - Los precios se representan con centavos: $19.99
   * - Evita errores de cálculo con más decimales
   * - En la BD se guarda como DECIMAL(10,2)
   * 
   * Ejemplos válidos:
   * ✓ 199.99
   * ✓ 1500
   * ✓ 0.01
   * ✓ 999999.99
   * 
   * Ejemplos inválidos:
   * ✗ 0 (no es positivo)
   * ✗ -100 (negativo)
   * ✗ 19.999 (más de 2 decimales)
   * ✗ "100" (string, aunque transform: true lo convertiría)
   * 
   * NOTA IMPORTANTE:
   * Con transform: true en ValidationPipe (main.ts),
   * el string "199.99" se convierte automáticamente a number.
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio: number;

  /**
   * STOCK - CANTIDAD DISPONIBLE
   * ============================
   * 
   * Validaciones:
   * 
   * @IsInt()
   * ↳ Debe ser un número ENTERO
   * ↳ No acepta decimales (no puedes tener 5.5 productos)
   * 
   * @Min(0)
   * ↳ Mínimo 0 (acepta 0, diferente a @IsPositive)
   * ↳ 0 significa "sin stock" pero es válido
   * 
   * ¿POR QUÉ @IsInt Y NO @IsNumber?
   * - El stock siempre es un número entero
   * - No tiene sentido 5.5 unidades
   * - @IsInt valida que no haya decimales
   * 
   * ¿POR QUÉ @Min(0) Y NO @IsPositive?
   * - @IsPositive: Mayor a 0 (no acepta 0)
   * - @Min(0): Mayor o igual a 0 (acepta 0)
   * - Queremos permitir stock = 0 (agotado)
   * 
   * Ejemplos válidos:
   * ✓ 0 (sin stock)
   * ✓ 10
   * ✓ 1000
   * 
   * Ejemplos inválidos:
   * ✗ -5 (negativo)
   * ✗ 10.5 (decimal)
   * ✗ "10" (string, aunque transform: true lo convertiría)
   */
  @IsInt()
  @Min(0)
  stock: number;

  /**
   * IMAGE URL - URL DE LA IMAGEN DEL PRODUCTO (OPCIONAL)
   * =====================================================
   * 
   * Validaciones:
   * @IsString() - Debe ser string si se proporciona
   * @IsOptional() - Campo opcional
   * 
   * Ejemplos válidos:
   * ✓ "https://example.com/laptop.jpg"
   * ✓ "https://cdn.tienda.com/images/product123.png"
   * ✓ undefined (no enviado)
   * 
   * Ejemplos inválidos:
   * ✗ 123 (no es string)
   * 
   * MEJORA OPCIONAL:
   * Para validar que sea una URL válida, podrías agregar:
   * 
   * @IsUrl({}, { message: 'Debe ser una URL válida' })
   * @IsOptional()
   * imageUrl?: string;
   * 
   * Esto validaría que sea formato http:// o https://
   */
  @IsString()
  @IsOptional()
  imageUrl?: string;

  /**
   * CATEGORY ID - ID DE LA CATEGORÍA (FOREIGN KEY)
   * ===============================================
   * 
   * Validaciones:
   * 
   * @IsInt()
   * ↳ Debe ser un número entero
   * ↳ Los IDs siempre son enteros
   * 
   * @IsPositive()
   * ↳ Debe ser mayor a 0
   * ↳ Los IDs autoincrementales empiezan en 1
   * 
   * ¿QUÉ ES categoryId?
   * - Es una FOREIGN KEY (clave foránea)
   * - Relaciona el producto con su categoría
   * - Debe existir una categoría con ese ID
   * 
   * VALIDACIÓN ADICIONAL EN EL SERVICE:
   * El DTO valida el formato (entero positivo),
   * pero el SERVICE valida que exista la categoría:
   * 
   * const category = await this.categoriesRepository.findOne({
   *   where: { id: categoryId, isActive: true }
   * });
   * if (!category) {
   *   throw new NotFoundException('Categoría no encontrada');
   * }
   * 
   * Ejemplos válidos:
   * ✓ 1
   * ✓ 5
   * ✓ 100
   * 
   * Ejemplos inválidos:
   * ✗ 0 (no es positivo)
   * ✗ -1 (negativo)
   * ✗ 1.5 (no es entero)
   * ✗ "1" (string, aunque transform: true lo convertiría)
   * ✗ 999 (puede ser válido en formato pero no existe en BD)
   */
  @IsInt()
  @IsPositive()
  categoryId: number;
}

/**
 * ====================================================================
 * EJEMPLOS DE REQUESTS
 * ====================================================================
 * 
 * 1️⃣ CREAR PRODUCTO COMPLETO:
 * POST /products
 * Content-Type: application/json
 * 
 * {
 *   "nombre": "Laptop HP Pavilion",
 *   "descripcion": "Laptop con procesador Intel Core i7, 16GB RAM, 512GB SSD",
 *   "precio": 1299.99,
 *   "stock": 15,
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
 *   "categoryId": 1
 * }
 * 
 * Respuesta (201 Created):
 * {
 *   "id": 1,
 *   "nombre": "Laptop HP Pavilion",
 *   "descripcion": "Laptop con procesador Intel Core i7, 16GB RAM, 512GB SSD",
 *   "precio": "1299.99",
 *   "stock": 15,
 *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:00:00.000Z",
 *   "updatedAt": "2025-11-17T10:00:00.000Z",
 *   "category": {  ← Eager loading trae la categoría automáticamente
 *     "id": 1,
 *     "nombre": "Electrónica",
 *     "descripcion": "Productos electrónicos",
 *     "isActive": true
 *   }
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 2️⃣ CREAR PRODUCTO MÍNIMO (sin campos opcionales):
 * POST /products
 * 
 * {
 *   "nombre": "Mouse Logitech",
 *   "precio": 29.99,
 *   "stock": 50,
 *   "categoryId": 1
 * }
 * 
 * Respuesta (201 Created):
 * {
 *   "id": 2,
 *   "nombre": "Mouse Logitech",
 *   "descripcion": null,  ← Opcional no proporcionado
 *   "precio": "29.99",
 *   "stock": 50,
 *   "imageUrl": null,  ← Opcional no proporcionado
 *   "isActive": true,
 *   "createdAt": "2025-11-17T10:05:00.000Z",
 *   "updatedAt": "2025-11-17T10:05:00.000Z",
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
 * 3️⃣ ERROR: PRECIO CON MÁS DE 2 DECIMALES:
 * POST /products
 * 
 * {
 *   "nombre": "Producto",
 *   "precio": 19.999,  ← 3 decimales
 *   "stock": 10,
 *   "categoryId": 1
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
 * 4️⃣ ERROR: STOCK NEGATIVO:
 * POST /products
 * 
 * {
 *   "nombre": "Producto",
 *   "precio": 100,
 *   "stock": -5,  ← Negativo
 *   "categoryId": 1
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
 * 5️⃣ ERROR: STOCK CON DECIMALES:
 * POST /products
 * 
 * {
 *   "nombre": "Producto",
 *   "precio": 100,
 *   "stock": 10.5,  ← Decimal
 *   "categoryId": 1
 * }
 * 
 * Respuesta (400 Bad Request):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "stock must be an integer number"
 *   ],
 *   "error": "Bad Request"
 * }
 * 
 * -------------------------------------------------------------------
 * 
 * 6️⃣ ERROR: CATEGORÍA NO EXISTE:
 * POST /products
 * 
 * {
 *   "nombre": "Producto",
 *   "precio": 100,
 *   "stock": 10,
 *   "categoryId": 999  ← No existe
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
 * 📚 CONCEPTOS: VALIDACIONES NUMÉRICAS
 * ====================================================================
 * 
 * 1. @IsNumber() VS @IsInt():
 *    
 *    @IsNumber() - Acepta cualquier número (entero o decimal)
 *    ✓ 100
 *    ✓ 100.5
 *    ✓ 100.99
 *    
 *    @IsInt() - Solo acepta números ENTEROS
 *    ✓ 100
 *    ✗ 100.5
 *    ✗ 100.99
 *    
 *    Usa @IsInt() para: IDs, cantidades, stock
 *    Usa @IsNumber() para: precios, pesos, medidas
 * 
 * 2. @IsPositive() VS @Min(0):
 *    
 *    @IsPositive() - Mayor a 0 (NO incluye 0)
 *    ✓ 0.01
 *    ✓ 1
 *    ✗ 0
 *    ✗ -1
 *    
 *    @Min(0) - Mayor o igual a 0 (incluye 0)
 *    ✓ 0
 *    ✓ 1
 *    ✗ -1
 *    
 *    Usa @IsPositive() para: precios, IDs
 *    Usa @Min(0) para: stock (0 = sin stock es válido)
 * 
 * 3. maxDecimalPlaces:
 *    
 *    @IsNumber({ maxDecimalPlaces: 2 })
 *    ↳ Limita la cantidad de decimales
 *    ↳ Perfecto para precios ($19.99)
 *    
 *    ✓ 19.99 (2 decimales)
 *    ✓ 19.9 (1 decimal)
 *    ✓ 19 (sin decimales)
 *    ✗ 19.999 (3 decimales)
 * 
 * 4. TRANSFORM EN ValidationPipe:
 *    
 *    En main.ts tenemos:
 *    app.useGlobalPipes(new ValidationPipe({
 *      transform: true,  ← Importante
 *    }));
 *    
 *    Esto convierte tipos automáticamente:
 *    "100" → 100 (string to number)
 *    "true" → true (string to boolean)
 *    
 *    Sin transform:
 *    { "precio": "100" } → ERROR (es string)
 *    
 *    Con transform:
 *    { "precio": "100" } → OK (se convierte a 100)
 * 
 * 5. VALIDACIÓN EN DTO VS VALIDACIÓN EN SERVICE:
 *    
 *    DTO (class-validator):
 *    ✓ Valida formato y tipo
 *    ✓ Valida rangos (min, max)
 *    ✓ Es rápido (no toca BD)
 *    
 *    Service (lógica de negocio):
 *    ✓ Valida existencia en BD
 *    ✓ Valida reglas de negocio
 *    ✓ Valida relaciones
 *    
 *    Ejemplo:
 *    DTO: "categoryId debe ser entero positivo"
 *    Service: "La categoría con ID 999 no existe"
 */