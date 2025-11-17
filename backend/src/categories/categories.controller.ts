/**
 * ====================================================================
 * CATEGORIES.CONTROLLER.TS - CONTROLADOR DE ENDPOINTS PARA CATEGORÍAS
 * ====================================================================
 * 
 * Este controlador define los endpoints HTTP para operaciones CRUD
 * de categorías. Es similar a UsersController pero más simple.
 * 
 * ENDPOINTS:
 * POST   /categories          - Crear categoría
 * GET    /categories          - Listar todas las categorías
 * GET    /categories/:id      - Obtener una categoría
 * PATCH  /categories/:id      - Actualizar categoría
 * DELETE /categories/:id      - Eliminar categoría (soft delete)
 * 
 * RESPONSABILIDADES:
 * 1. Recibir requests HTTP
 * 2. Validar parámetros de ruta (IDs)
 * 3. Delegar lógica al CategoriesService
 * 4. Retornar respuestas con códigos HTTP apropiados
 */

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * @Controller('categories')
 * =========================
 * Define la ruta base para todos los endpoints: /categories
 * 
 * Todos los métodos dentro se acceden relativo a esta ruta:
 * - @Get() → GET /categories
 * - @Get(':id') → GET /categories/:id
 * - @Post() → POST /categories
 */
@Controller('categories')
export class CategoriesController {
  
  /**
   * CONSTRUCTOR - INYECCIÓN DE DEPENDENCIAS
   * =========================================
   * 
   * private readonly categoriesService: CategoriesService
   * - Inyecta el servicio de categorías
   * - readonly = no se puede reasignar
   * - private = solo accesible en esta clase
   * 
   * El controlador NO debe tener lógica de negocio,
   * solo delega al service.
   */
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * ====================================================================
   * POST /categories - CREAR NUEVA CATEGORÍA
   * ====================================================================
   * 
   * @Post()
   * - Método HTTP POST
   * - Ruta: POST /categories
   * 
   * @HttpCode(HttpStatus.CREATED)
   * - Retorna código 201 (Created)
   * - Por defecto POST retorna 200, pero 201 es más semántico
   * 
   * @Body() createCategoryDto: CreateCategoryDto
   * - Extrae el body del request
   * - Lo valida automáticamente con class-validator
   * - Lo transforma a CreateCategoryDto
   * 
   * EJEMPLO DE REQUEST:
   * POST /categories
   * Content-Type: application/json
   * 
   * {
   *   "nombre": "Electrónica",
   *   "descripcion": "Productos electrónicos"
   * }
   * 
   * RESPUESTA (201 Created):
   * {
   *   "id": 1,
   *   "nombre": "Electrónica",
   *   "descripcion": "Productos electrónicos",
   *   "isActive": true,
   *   "createdAt": "2025-11-17T10:00:00.000Z",
   *   "updatedAt": "2025-11-17T10:00:00.000Z"
 * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * ====================================================================
   * GET /categories - LISTAR TODAS LAS CATEGORÍAS
   * ====================================================================
   * 
   * @Get()
   * - Método HTTP GET
   * - Ruta: GET /categories
   * - No requiere parámetros
   * 
   * EJEMPLO DE REQUEST:
   * GET /categories
   * 
   * RESPUESTA (200 OK):
   * [
   *   {
   *     "id": 1,
   *     "nombre": "Electrónica",
   *     "descripcion": "Productos electrónicos",
   *     "isActive": true,
   *     "createdAt": "2025-11-17T10:00:00Z",
   *     "updatedAt": "2025-11-17T10:00:00Z",
   *     "products": [
   *       {
   *         "id": 1,
   *         "nombre": "Laptop HP",
   *         "precio": "1299.99",
   *         "stock": 10
   *       },
   *       { ... }
   *     ]
   *   },
   *   { ... }
   * ]
   * 
   * NOTA:
   * Solo retorna categorías activas (isActive = true).
   * Incluye sus productos relacionados (relations: ['products']).
   */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * ====================================================================
   * GET /categories/:id - OBTENER UNA CATEGORÍA POR ID
   * ====================================================================
   * 
   * @Get(':id')
   * - Método HTTP GET
   * - Ruta: GET /categories/:id
   * - :id es un parámetro dinámico
   * 
   * @Param('id', ParseIntPipe) id: number
   * - @Param('id') extrae el parámetro :id de la URL
   * - ParseIntPipe convierte string a number y valida
   * - Si no es un número, lanza 400 Bad Request
   * 
   * ¿QUÉ HACE ParseIntPipe?
   * - URL: /categories/abc → ERROR 400 "Validation failed (numeric string is expected)"
   * - URL: /categories/1.5 → ERROR 400 (no es entero)
   * - URL: /categories/1   → OK, id = 1 (number)
   * 
   * EJEMPLO DE REQUEST:
   * GET /categories/1
   * 
   * RESPUESTA (200 OK):
   * {
   *   "id": 1,
   *   "nombre": "Electrónica",
   *   "descripcion": "Productos electrónicos",
   *   "isActive": true,
   *   "createdAt": "2025-11-17T10:00:00Z",
   *   "updatedAt": "2025-11-17T10:00:00Z",
   *   "products": [
   *     { "id": 1, "nombre": "Laptop HP", ... },
   *     { "id": 2, "nombre": "Mouse", ... }
   *   ]
   * }
   * 
   * ERROR (404 Not Found):
   * {
   *   "statusCode": 404,
   *   "message": "Categoría con ID 999 no encontrada",
   *   "error": "Not Found"
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  /**
   * ====================================================================
   * PATCH /categories/:id - ACTUALIZAR UNA CATEGORÍA
   * ====================================================================
   * 
   * @Patch(':id')
   * - Método HTTP PATCH (actualización parcial)
   * - Ruta: PATCH /categories/:id
   * 
   * @Param('id', ParseIntPipe) id: number
   * - Extrae y valida el ID de la ruta
   * 
   * @Body() updateCategoryDto: UpdateCategoryDto
   * - Extrae el body del request
   * - Valida con UpdateCategoryDto (todos los campos opcionales)
   * 
   * ¿POR QUÉ PATCH Y NO PUT?
   * - PATCH: Actualización parcial (solo envías campos a cambiar)
   * - PUT: Reemplazo completo (envías todos los campos)
   * - PATCH es más flexible para APIs REST modernas
   * 
   * EJEMPLO DE REQUEST:
   * PATCH /categories/1
   * Content-Type: application/json
   * 
   * {
   *   "descripcion": "Nueva descripción actualizada"
   * }
   * 
   * RESPUESTA (200 OK):
   * {
   *   "id": 1,
   *   "nombre": "Electrónica",  ← No cambió
   *   "descripcion": "Nueva descripción actualizada",  ← Actualizado
   *   "isActive": true,
   *   "createdAt": "2025-11-17T10:00:00Z",
   *   "updatedAt": "2025-11-17T12:00:00Z"  ← Actualizado automáticamente
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * ====================================================================
   * DELETE /categories/:id - ELIMINAR UNA CATEGORÍA (SOFT DELETE)
   * ====================================================================
   * 
   * @Delete(':id')
   * - Método HTTP DELETE
   * - Ruta: DELETE /categories/:id
   * 
   * @HttpCode(HttpStatus.NO_CONTENT)
   * - Retorna código 204 (No Content)
   * - 204 = operación exitosa sin contenido en respuesta
   * - Es el código estándar para DELETE exitoso
   * 
   * @Param('id', ParseIntPipe) id: number
   * - Extrae y valida el ID
   * 
   * EJEMPLO DE REQUEST:
   * DELETE /categories/1
   * 
   * RESPUESTA EXITOSA (204 No Content):
   * (Sin body, solo código 204)
   * 
   * ERROR (400 Bad Request) - Tiene productos activos:
   * {
   *   "statusCode": 400,
   *   "message": "No se puede eliminar la categoría porque tiene 5 producto(s) activo(s) asociado(s)",
   *   "error": "Bad Request"
   * }
   * 
   * ERROR (404 Not Found) - No existe:
   * {
   *   "statusCode": 404,
   *   "message": "Categoría con ID 999 no encontrada",
   *   "error": "Not Found"
   * }
   * 
   * NOTA IMPORTANTE:
   * No se eliminan datos físicamente (soft delete).
   * Solo se marca isActive = false.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS: DECORADORES HTTP
 * ====================================================================
 * 
 * 1. MÉTODOS HTTP:
 *    
 *    @Get()    - Obtener recursos (SELECT)
 *    @Post()   - Crear recursos (INSERT)
 *    @Patch()  - Actualizar parcialmente (UPDATE)
 *    @Put()    - Reemplazar completamente (UPDATE)
 *    @Delete() - Eliminar recursos (DELETE/UPDATE para soft delete)
 * 
 * 2. CÓDIGOS HTTP:
 *    
 *    200 OK          - GET, PATCH exitosos
 *    201 Created     - POST exitoso
 *    204 No Content  - DELETE exitoso
 *    400 Bad Request - Validación fallida
 *    404 Not Found   - Recurso no existe
 *    409 Conflict    - Nombre duplicado
 * 
 * 3. EXTRACCIÓN DE DATOS:
 *    
 *    @Body()       - Body del request (JSON)
 *    @Param('id')  - Parámetro de ruta (/categories/:id)
 *    @Query('key') - Query string (?key=value)
 *    @Headers()    - Headers del request
 * 
 * 4. PIPES DE VALIDACIÓN:
 *    
 *    ParseIntPipe
 *    - Convierte string a number
 *    - Valida que sea un entero
 *    - Lanza 400 si falla
 *    
 *    ParseBoolPipe
 *    - Convierte "true"/"false" a boolean
 *    
 *    ValidationPipe (global en main.ts)
 *    - Valida DTOs con class-validator
 *    - Transforma tipos automáticamente
 * 
 * 5. DIFERENCIA: CONTROLLER VS SERVICE:
 *    
 *    Controller:
 *    - Maneja HTTP (requests, responses)
 *    - Valida parámetros de ruta
 *    - Define rutas y métodos
 *    - NO tiene lógica de negocio
 *    
 *    Service:
 *    - Lógica de negocio
 *    - Interacción con BD
 *    - Validaciones de negocio
 *    - Independiente de HTTP
 *    
 *    Esta separación permite:
 *    - Reutilizar services en otros contextos
 *    - Testear lógica sin HTTP
 *    - Cambiar transporte (HTTP → WebSockets)
 * 
 * 6. RUTAS DINÁMICAS:
 *    
 *    @Get(':id')    - /categories/1, /categories/abc
 *    @Get(':id/:action') - /categories/1/activate
 *    
 *    Orden importa:
 *    @Get('active')  ← Debe ir ANTES de @Get(':id')
 *    @Get(':id')     ← Si va primero, captura "active" como ID
 * 
 * 7. ASYNC/AWAIT:
 *    
 *    Todos los métodos del controller retornan Promises
 *    porque el service es async.
 *    
 *    NestJS maneja esto automáticamente:
 *    - Espera a que la Promise se resuelva
 *    - Serializa el resultado a JSON
 *    - Retorna la respuesta HTTP
 *    
 *    No necesitas await en el controller:
 *    return this.service.method();  ← OK
 *    return await this.service.method();  ← También OK pero redundante
 */
