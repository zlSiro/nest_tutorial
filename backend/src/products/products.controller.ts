/**
 * ====================================================================
 * PRODUCTS.CONTROLLER.TS - CONTROLADOR DE ENDPOINTS PARA PRODUCTOS
 * ====================================================================
 * 
 * Este controlador es similar a CategoriesController pero con
 * una característica adicional: filtrado por query params.
 * 
 * ENDPOINTS:
 * POST   /products              - Crear producto
 * GET    /products              - Listar todos los productos
 * GET    /products?categoryId=1 - Filtrar por categoría
 * GET    /products/:id          - Obtener un producto
 * PATCH  /products/:id          - Actualizar producto
 * DELETE /products/:id          - Eliminar producto (soft delete)
 * 
 * DIFERENCIA CON CATEGORIES:
 * GET /products acepta query param opcional ?categoryId=1
 * para filtrar productos por categoría.
 */

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * @Controller('products')
 * =======================
 * Define la ruta base: /products
 */
@Controller('products')
export class ProductsController {
  
  /**
   * CONSTRUCTOR - INYECCIÓN DEL SERVICE
   * ====================================
   * 
   * Inyecta ProductsService para delegar lógica de negocio.
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * ====================================================================
   * POST /products - CREAR NUEVO PRODUCTO
   * ====================================================================
   * 
   * @Post()
   * - Método HTTP POST
   * - Ruta: POST /products
   * 
   * @HttpCode(HttpStatus.CREATED)
   * - Retorna 201 Created
   * 
   * @Body() createProductDto: CreateProductDto
   * - Extrae body del request
   * - Valida con CreateProductDto
   * 
   * EJEMPLO DE REQUEST:
   * POST /products
   * Content-Type: application/json
   * 
   * {
   *   "nombre": "Laptop HP Pavilion",
   *   "descripcion": "Laptop con procesador Intel Core i7",
   *   "precio": 1299.99,
   *   "stock": 15,
   *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
   *   "categoryId": 1
   * }
   * 
   * RESPUESTA (201 Created):
   * {
   *   "id": 1,
   *   "nombre": "Laptop HP Pavilion",
   *   "descripcion": "Laptop con procesador Intel Core i7",
   *   "precio": "1299.99",
   *   "stock": 15,
   *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
   *   "isActive": true,
   *   "createdAt": "2025-11-17T10:00:00.000Z",
   *   "updatedAt": "2025-11-17T10:00:00.000Z",
   *   "category": {  ← Eager loading automático
   *     "id": 1,
   *     "nombre": "Electrónica",
   *     "descripcion": "Productos electrónicos",
   *     "isActive": true
   *   }
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * ====================================================================
   * GET /products - LISTAR PRODUCTOS (CON FILTRO OPCIONAL)
   * ====================================================================
   * 
   * @Get()
   * - Método HTTP GET
   * - Ruta: GET /products o GET /products?categoryId=1
   * 
   * @Query('categoryId', ParseIntPipe) categoryId?: number
   * - @Query('categoryId') extrae el query param ?categoryId=...
   * - ParseIntPipe convierte string a number
   * - ? indica que es OPCIONAL
   * 
   * LÓGICA CONDICIONAL:
   * - Si viene categoryId → filtrar por categoría
   * - Si no viene → retornar todos los productos
   * 
   * ¿QUÉ HACE ParseIntPipe EN QUERY OPCIONAL?
   * - URL: /products → OK, categoryId = undefined
   * - URL: /products?categoryId=1 → OK, categoryId = 1
   * - URL: /products?categoryId=abc → ERROR 400
   * 
   * EJEMPLO 1: TODOS LOS PRODUCTOS
   * GET /products
   * 
   * RESPUESTA (200 OK):
   * [
   *   {
   *     "id": 1,
   *     "nombre": "Laptop HP",
   *     "precio": "1299.99",
   *     "stock": 15,
   *     "category": { "id": 1, "nombre": "Electrónica" }
   *   },
   *   {
   *     "id": 2,
   *     "nombre": "Camiseta Nike",
   *     "precio": "29.99",
   *     "stock": 100,
   *     "category": { "id": 2, "nombre": "Ropa" }
   *   },
   *   { ... }
   * ]
   * 
   * EJEMPLO 2: FILTRAR POR CATEGORÍA
   * GET /products?categoryId=1
   * 
   * RESPUESTA (200 OK):
   * [
   *   {
   *     "id": 1,
   *     "nombre": "Laptop HP",
   *     "precio": "1299.99",
   *     "stock": 15,
   *     "category": { "id": 1, "nombre": "Electrónica" }
   *   },
   *   {
   *     "id": 3,
   *     "nombre": "Mouse Logitech",
   *     "precio": "29.99",
   *     "stock": 50,
   *     "category": { "id": 1, "nombre": "Electrónica" }
   *   }
   * ]
   * 
   * NOTA:
   * Si la categoría no existe o no tiene productos,
   * retorna array vacío [].
   */
  @Get()
  findAll(@Query('categoryId', ParseIntPipe) categoryId?: number) {
    /**
     * LÓGICA CONDICIONAL
     * ==================
     * 
     * if (categoryId) - Si el query param existe
     * ↳ Llamar a findByCategory(categoryId)
     * 
     * else - Si no existe (undefined)
     * ↳ Llamar a findAll()
     * 
     * Esto permite un único endpoint con dos comportamientos:
     * 1. Listar todo
     * 2. Filtrar por categoría
     * 
     * ALTERNATIVA:
     * Podríamos tener dos endpoints:
     * GET /products
     * GET /categories/:id/products
     * 
     * Pero usar query params es más RESTful y flexible.
     */
    if (categoryId) {
      return this.productsService.findByCategory(categoryId);
    }
    return this.productsService.findAll();
  }

  /**
   * ====================================================================
   * GET /products/:id - OBTENER UN PRODUCTO POR ID
   * ====================================================================
   * 
   * @Get(':id')
   * - Método HTTP GET
   * - Ruta: GET /products/:id
   * 
   * @Param('id', ParseIntPipe) id: number
   * - Extrae :id de la URL
   * - Valida que sea entero con ParseIntPipe
   * 
   * EJEMPLO DE REQUEST:
   * GET /products/1
   * 
   * RESPUESTA (200 OK):
   * {
   *   "id": 1,
   *   "nombre": "Laptop HP Pavilion",
   *   "descripcion": "Laptop con procesador Intel Core i7",
   *   "precio": "1299.99",
   *   "stock": 15,
   *   "imageUrl": "https://cdn.tienda.com/laptop-hp.jpg",
   *   "isActive": true,
   *   "createdAt": "2025-11-17T10:00:00Z",
   *   "updatedAt": "2025-11-17T10:00:00Z",
   *   "category": {
   *     "id": 1,
   *     "nombre": "Electrónica",
   *     "descripcion": "Productos electrónicos",
   *     "isActive": true
   *   }
   * }
   * 
   * ERROR (404 Not Found):
   * {
   *   "statusCode": 404,
   *   "message": "Producto con ID 999 no encontrado",
   *   "error": "Not Found"
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * ====================================================================
   * PATCH /products/:id - ACTUALIZAR UN PRODUCTO
   * ====================================================================
   * 
   * @Patch(':id')
   * - Método HTTP PATCH (actualización parcial)
   * - Ruta: PATCH /products/:id
   * 
   * @Param('id', ParseIntPipe) id: number
   * - Extrae y valida ID
   * 
   * @Body() updateProductDto: UpdateProductDto
   * - Extrae body con campos a actualizar
   * - Todos los campos son opcionales
   * 
   * EJEMPLO 1: ACTUALIZAR PRECIO Y STOCK
   * PATCH /products/1
   * Content-Type: application/json
   * 
   * {
   *   "precio": 1199.99,
   *   "stock": 8
   * }
   * 
   * RESPUESTA (200 OK):
   * {
   *   "id": 1,
   *   "nombre": "Laptop HP Pavilion",  ← No cambió
   *   "precio": "1199.99",  ← Actualizado
   *   "stock": 8,  ← Actualizado
   *   "category": { ... }  ← No cambió
   * }
   * 
   * EJEMPLO 2: CAMBIAR CATEGORÍA
   * PATCH /products/1
   * 
   * {
   *   "categoryId": 3
   * }
   * 
   * RESPUESTA (200 OK):
   * {
   *   "id": 1,
   *   "nombre": "Laptop HP Pavilion",
   *   "precio": "1199.99",
   *   "stock": 8,
   *   "category": {  ← Nueva categoría
   *     "id": 3,
   *     "nombre": "Ofertas",
   *     "descripcion": "Productos en oferta"
   *   }
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * ====================================================================
   * DELETE /products/:id - ELIMINAR UN PRODUCTO (SOFT DELETE)
   * ====================================================================
   * 
   * @Delete(':id')
   * - Método HTTP DELETE
   * - Ruta: DELETE /products/:id
   * 
   * @HttpCode(HttpStatus.NO_CONTENT)
   * - Retorna 204 No Content
   * - Sin body en la respuesta
   * 
   * @Param('id', ParseIntPipe) id: number
   * - Extrae y valida ID
   * 
   * EJEMPLO DE REQUEST:
   * DELETE /products/1
   * 
   * RESPUESTA EXITOSA (204 No Content):
   * (Sin body, solo código 204)
   * 
   * ERROR (404 Not Found):
   * {
   *   "statusCode": 404,
   *   "message": "Producto con ID 999 no encontrado",
   *   "error": "Not Found"
   * }
   * 
   * NOTA:
   * - Soft delete (isActive = false)
   * - El producto sigue en la BD
   * - La categoría mantiene la relación
   * - Ya no aparece en listados
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS: QUERY PARAMS VS PATH PARAMS
 * ====================================================================
 * 
 * 1. PATH PARAMS (Parámetros de Ruta):
 *    
 *    URL: /products/1
 *         │
 *         └─ Path param
 *    
 *    Código:
 *    @Get(':id')
 *    findOne(@Param('id') id: number)
 *    
 *    Uso:
 *    - Identificar un recurso específico
 *    - Obligatorios
 *    - Parte de la ruta
 * 
 * 2. QUERY PARAMS (Parámetros de Consulta):
 *    
 *    URL: /products?categoryId=1&minPrice=100
 *                   │                  │
 *                   └─ Query params ─────┘
 *    
 *    Código:
 *    @Get()
 *    findAll(
 *      @Query('categoryId') categoryId?: number,
 *      @Query('minPrice') minPrice?: number
 *    )
 *    
 *    Uso:
 *    - Filtrar, ordenar, paginar
 *    - Opcionales
 *    - Después del ?
 * 
 * 3. CUÁNDO USAR CADA UNO:
 *    
 *    Path Params:
 *    ✓ GET /products/1 (obtener producto 1)
 *    ✓ DELETE /users/5 (eliminar usuario 5)
 *    ✓ PATCH /categories/3 (actualizar categoría 3)
 *    
 *    Query Params:
 *    ✓ GET /products?categoryId=1 (filtrar)
 *    ✓ GET /products?page=2&limit=10 (paginar)
 *    ✓ GET /products?sort=price&order=asc (ordenar)
 *    ✓ GET /products?search=laptop (buscar)
 * 
 * 4. VALIDACIÓN CON ParseIntPipe:
 *    
 *    Path Param:
 *    @Param('id', ParseIntPipe) id: number
 *    ↳ /products/abc → 400 Bad Request
 *    
 *    Query Param REQUERIDO:
 *    @Query('page', ParseIntPipe) page: number
 *    ↳ /products → 400 (falta page)
 *    ↳ /products?page=abc → 400 (no es número)
 *    
 *    Query Param OPCIONAL:
 *    @Query('categoryId', ParseIntPipe) categoryId?: number
 *    ↳ /products → OK (categoryId = undefined)
 *    ↳ /products?categoryId=1 → OK (categoryId = 1)
 *    ↳ /products?categoryId=abc → 400 (no es número)
 * 
 * 5. MÚLTIPLES QUERY PARAMS:
 *    
 *    @Get()
 *    findAll(
 *      @Query('categoryId', ParseIntPipe) categoryId?: number,
 *      @Query('minPrice') minPrice?: number,
 *      @Query('maxPrice') maxPrice?: number,
 *      @Query('search') search?: string,
 *    ) {
 *      // Lógica con múltiples filtros
 *    }
 *    
 *    URL: /products?categoryId=1&minPrice=100&maxPrice=500&search=laptop
 * 
 * 6. ORDEN DE RUTAS IMPORTANTE:
 *    
 *    CORRECTO:
 *    @Get('search')           ← Ruta estática primero
 *    findBySearch(@Query()...)
 *    
 *    @Get(':id')              ← Ruta dinámica después
 *    findOne(@Param('id')...)
 *    
 *    INCORRECTO:
 *    @Get(':id')              ← Captura "search" como ID
 *    findOne(@Param('id')...)
 *    
 *    @Get('search')           ← Nunca se ejecuta
 *    findBySearch(@Query()...)
 *    
 *    NestJS evalúa rutas de arriba hacia abajo.
 *    Rutas estáticas siempre antes de dinámicas.
 * 
 * 7. PATRONES COMUNES:
 *    
 *    Paginación:
 *    GET /products?page=1&limit=10
 *    
 *    Filtrado:
 *    GET /products?categoryId=1&inStock=true
 *    
 *    Búsqueda:
 *    GET /products?search=laptop&minPrice=500
 *    
 *    Ordenamiento:
 *    GET /products?sortBy=price&order=desc
 *    
 *    Combinado:
 *    GET /products?categoryId=1&page=1&limit=10&sortBy=price
 */
