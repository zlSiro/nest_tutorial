/**
 * ====================================================================
 * CATEGORIES.SERVICE.TS - SERVICIO DE LÓGICA DE NEGOCIO PARA CATEGORÍAS
 * ====================================================================
 * 
 * Este servicio maneja toda la lógica de negocio relacionada con categorías.
 * Es más simple que UsersService porque no maneja passwords ni autenticación.
 * 
 * RESPONSABILIDADES:
 * 1. Crear categorías (con validación de nombres duplicados)
 * 2. Listar todas las categorías activas
 * 3. Buscar una categoría por ID (con sus productos)
 * 4. Actualizar categorías (validando nombres duplicados)
 * 5. Eliminar categorías (soft delete, validando que no tenga productos)
 * 
 * VALIDACIONES DE NEGOCIO:
 * - No permitir nombres duplicados
 * - No permitir eliminar categorías con productos activos
 * - Solo trabajar con categorías activas (isActive = true)
 */

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

/**
 * @Injectable()
 * ============
 * Marca esta clase como un provider que puede ser inyectado.
 * NestJS crea una única instancia (Singleton) y la comparte.
 */
@Injectable()
export class CategoriesService {
  
  /**
   * CONSTRUCTOR - INYECCIÓN DE DEPENDENCIAS
   * ========================================
   * 
   * @InjectRepository(Category)
   * - Inyecta el repositorio de TypeORM para Category
   * - TypeORM nos da métodos: find, findOne, save, create, etc.
   * 
   * Repository<Category>
   * - Es el tipo del repositorio
   * - Tiene métodos tipados para trabajar con Category
   * 
   * private readonly
   * - Solo accesible dentro de la clase
   * - readonly = no se puede reasignar
   */
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * ====================================================================
   * CREATE - CREAR UNA NUEVA CATEGORÍA
   * ====================================================================
   * 
   * Este método:
   * 1. Valida que el nombre no exista (nombres únicos)
   * 2. Crea la entidad Category
   * 3. La guarda en la base de datos
   * 
   * @param createCategoryDto - Datos de la nueva categoría
   * @returns Promise<Category> - La categoría creada
   * @throws ConflictException - Si el nombre ya existe
   * 
   * FLUJO:
   * 1. Buscar si existe una categoría con ese nombre
   * 2. Si existe, lanzar excepción 409 Conflict
   * 3. Si no existe, crear y guardar
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    /**
     * PASO 1: VALIDAR QUE EL NOMBRE NO EXISTA
     * ========================================
     * 
     * ¿Por qué validar nombres duplicados?
     * - Los nombres de categorías deben ser únicos
     * - Mejora la UX (evita confusión)
     * - Podría agregarse UNIQUE constraint en la BD
     * 
     * findOne({ where: { nombre: ... } })
     * - Busca UNA categoría con ese nombre
     * - Retorna la categoría o null si no existe
     * - No filtra por isActive (queremos evitar duplicados incluso inactivos)
     * 
     * SQL Equivalente:
     * SELECT * FROM categories WHERE nombre = 'Electrónica' LIMIT 1;
     */
    const existingCategory = await this.categoriesRepository.findOne({
      where: { nombre: createCategoryDto.nombre },
    });

    /**
     * Si encontramos una categoría con ese nombre,
     * lanzamos una excepción HTTP 409 Conflict
     */
    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    /**
     * PASO 2: CREAR LA ENTIDAD
     * =========================
     * 
     * create() NO guarda en la BD, solo crea una instancia.
     * 
     * Convierte:
     * { nombre: "Electrónica", descripcion: "..." }
     * 
     * En:
     * Category {
     *   nombre: "Electrónica",
     *   descripcion: "...",
     *   isActive: true,  ← Valor por defecto
     *   createdAt: undefined,  ← Se genera en save()
     *   updatedAt: undefined   ← Se genera en save()
     * }
     */
    const category = this.categoriesRepository.create(createCategoryDto);

    /**
     * PASO 3: GUARDAR EN LA BASE DE DATOS
     * ====================================
     * 
     * save() ejecuta:
     * INSERT INTO categories (nombre, descripcion, isActive, createdAt, updatedAt)
     * VALUES ('Electrónica', '...', true, NOW(), NOW());
     * 
     * Retorna la entidad guardada con:
     * - id generado (autoincrement)
     * - timestamps creados (createdAt, updatedAt)
     * 
     * await = Esperamos a que termine la operación en BD
     */
    return await this.categoriesRepository.save(category);
  }

  /**
   * ====================================================================
   * FIND ALL - OBTENER TODAS LAS CATEGORÍAS ACTIVAS
   * ====================================================================
   * 
   * Este método:
   * 1. Busca todas las categorías activas
   * 2. Incluye sus productos relacionados (eager loading manual)
   * 
   * @returns Promise<Category[]> - Array de categorías
   * 
   * NOTA:
   * En Category.entity.ts NO usamos eager: true en @OneToMany
   * porque querríamos los productos en TODAS las consultas.
   * Aquí decidimos manualmente cuándo traerlos con relations.
   */
  async findAll(): Promise<Category[]> {
    /**
     * find()
     * ======
     * Busca múltiples registros.
     * 
     * where: { isActive: true }
     * - Solo categorías activas (soft delete)
     * - Filtra por isActive = true
     * 
     * relations: ['products']
     * - Trae los productos relacionados
     * - Hace un JOIN con la tabla products
     * - Es como eager loading pero manual
     * 
     * SQL Equivalente:
     * SELECT c.*, p.*
     * FROM categories c
     * LEFT JOIN products p ON c.id = p.category_id
     * WHERE c.isActive = true;
     * 
     * Retorna:
     * [
     *   {
     *     id: 1,
     *     nombre: "Electrónica",
     *     products: [
     *       { id: 1, nombre: "Laptop", ... },
     *       { id: 2, nombre: "Mouse", ... }
     *     ]
     *   },
     *   { ... }
     * ]
     */
    return await this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['products'],
    });
  }

  /**
   * ====================================================================
   * FIND ONE - BUSCAR UNA CATEGORÍA POR ID
   * ====================================================================
   * 
   * Este método:
   * 1. Busca una categoría activa por ID
   * 2. Incluye sus productos relacionados
   * 3. Lanza excepción si no existe
   * 
   * @param id - ID de la categoría
   * @returns Promise<Category> - La categoría encontrada
   * @throws NotFoundException - Si no existe o no está activa
   */
  async findOne(id: number): Promise<Category> {
    /**
     * findOne()
     * =========
     * Busca UN registro que coincida con las condiciones.
     * 
     * where: { id, isActive: true }
     * - Equivalente a: where: { id: id, isActive: true }
     * - Busca por ID Y que esté activa
     * 
     * relations: ['products']
     * - Trae los productos de esta categoría
     * 
     * SQL Equivalente:
     * SELECT c.*, p.*
     * FROM categories c
     * LEFT JOIN products p ON c.id = p.category_id
     * WHERE c.id = 1 AND c.isActive = true;
     */
    const category = await this.categoriesRepository.findOne({
      where: { id, isActive: true },
      relations: ['products'],
    });

    /**
     * Si no encontramos la categoría:
     * - Puede que no exista
     * - O puede que esté inactiva (isActive = false)
     * 
     * Lanzamos NotFoundException (404)
     */
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  /**
   * ====================================================================
   * UPDATE - ACTUALIZAR UNA CATEGORÍA
   * ====================================================================
   * 
   * Este método:
   * 1. Busca la categoría por ID (valida que exista)
   * 2. Si se actualiza el nombre, valida que no esté duplicado
   * 3. Actualiza los campos proporcionados
   * 4. Guarda los cambios
   * 
   * @param id - ID de la categoría a actualizar
   * @param updateCategoryDto - Campos a actualizar
   * @returns Promise<Category> - La categoría actualizada
   * @throws NotFoundException - Si la categoría no existe
   * @throws ConflictException - Si el nuevo nombre ya existe
   * 
   * IMPORTANTE:
   * Solo actualiza los campos enviados (PATCH parcial).
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    /**
     * PASO 1: VERIFICAR QUE LA CATEGORÍA EXISTA
     * ==========================================
     * 
     * Reutilizamos findOne() que:
     * - Busca la categoría
     * - Valida que esté activa
     * - Lanza excepción si no existe
     * 
     * Esto evita duplicar código de validación.
     */
    const category = await this.findOne(id)

    /**
     * PASO 2: VALIDAR NOMBRE DUPLICADO (SI SE ACTUALIZA EL NOMBRE)
     * =============================================================
     * 
     * Solo validamos si:
     * 1. updateCategoryDto.nombre existe (se está actualizando)
     * 2. Es diferente al nombre actual
     * 
     * ¿Por qué verificar que sea diferente?
     * Si actualizas sin cambiar el nombre, no hay conflicto.
     * 
     * Ejemplo:
     * PATCH /categories/1
     * { "nombre": "Electrónica" }  ← Mismo nombre que ya tiene
     * ✓ No hay conflicto, es el mismo
     * 
     * PATCH /categories/1
     * { "nombre": "Ropa" }  ← Intenta usar nombre de otra categoría
     * ✗ Conflicto si "Ropa" ya existe
     */
    if (updateCategoryDto.nombre && updateCategoryDto.nombre !== category.nombre) {
      const categoriaExistente = await this.categoriesRepository.findOne({
        where: { nombre: updateCategoryDto.nombre}
      });

      if (categoriaExistente) {
        throw new ConflictException("Ya existe una categoria con ese nombre")
      }
    }

    /**
     * PASO 3: ACTUALIZAR CAMPOS
     * ==========================
     * 
     * Object.assign(target, source)
     * - Copia propiedades de source a target
     * - Solo copia las propiedades que existen en source
     * 
     * Ejemplo:
     * category = { id: 1, nombre: "Electrónica", descripcion: "..." }
     * updateCategoryDto = { descripcion: "Nueva descripción" }
     * 
     * Después de Object.assign:
     * category = { id: 1, nombre: "Electrónica", descripcion: "Nueva descripción" }
     * 
     * Solo se actualizó descripcion, nombre quedó igual.
     */
    Object.assign(category, updateCategoryDto)

    /**
     * PASO 4: GUARDAR CAMBIOS
     * ========================
     * 
     * save() detecta que la entidad ya existe (tiene ID) y hace UPDATE:
     * UPDATE categories
     * SET descripcion = 'Nueva descripción', updatedAt = NOW()
     * WHERE id = 1;
     * 
     * updatedAt se actualiza automáticamente gracias a @UpdateDateColumn
     */
    return await this.categoriesRepository.save(category)
  }

  /**
   * ====================================================================
   * REMOVE - ELIMINAR UNA CATEGORÍA (SOFT DELETE)
   * ====================================================================
   * 
   * Este método:
   * 1. Busca la categoría (sin filtrar por isActive)
   * 2. Valida que NO tenga productos activos
   * 3. Marca como inactiva (soft delete)
   * 
   * @param id - ID de la categoría a eliminar
   * @returns Promise<void>
   * @throws NotFoundException - Si la categoría no existe
   * @throws BadRequestException - Si tiene productos activos
   * 
   * REGLA DE NEGOCIO IMPORTANTE:
   * No permitimos eliminar categorías con productos activos.
   * Esto previene inconsistencias (productos huérfanos).
   */
  async remove(id: number): Promise<void> {
    /**
     * PASO 1: BUSCAR LA CATEGORÍA (SIN FILTRAR POR isActive)
     * =======================================================
     * 
     * ¿Por qué no usar findOne()?
     * - findOne() filtra por isActive = true
     * - Si la categoría ya está inactiva, no la encontraría
     * - Queremos dar un mensaje claro: "no existe" vs "tiene productos"
     * 
     * relations: ['products']
     * - NECESITAMOS los productos para validar si tiene activos
     */
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    /**
     * PASO 2: VALIDAR QUE NO TENGA PRODUCTOS ACTIVOS
     * ===============================================
     * 
     * REGLA DE NEGOCIO:
     * No se puede eliminar una categoría si tiene productos activos.
     * 
     * category.products?.filter((p) => p.isActive)
     * - ? operador opcional (por si products es undefined)
     * - filter() retorna solo productos con isActive = true
     * - || [] si products es undefined, usa array vacío
     * 
     * Ejemplo:
     * category.products = [
     *   { id: 1, nombre: "Laptop", isActive: true },
     *   { id: 2, nombre: "Mouse", isActive: false },
     *   { id: 3, nombre: "Teclado", isActive: true }
     * ]
     * 
     * activeProducts = [Laptop, Teclado] (2 productos)
     * 
     * ¿Por qué esta validación?
     * 1. Integridad referencial
     * 2. No queremos productos sin categoría activa
     * 3. Obligamos a eliminar/reubicar productos primero
     */
    const activeProducts = category.products?.filter((p) => p.isActive) || [];

    if (activeProducts.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${activeProducts.length} producto(s) activo(s) asociado(s)`,
      );
    }

    /**
     * PASO 3: SOFT DELETE
     * ====================
     * 
     * En lugar de DELETE FROM categories WHERE id = 1:
     * UPDATE categories SET isActive = false WHERE id = 1;
     * 
     * VENTAJAS DEL SOFT DELETE:
     * 1. No perdemos datos (auditoría)
     * 2. Podemos recuperar si fue un error
     * 3. Mantenemos historial
     * 4. Los productos relacionados siguen existiendo
     * 
     * La categoría seguirá en la BD pero isActive = false,
     * por lo que no aparecerá en findAll() ni findOne().
     */
    category.isActive = false;
    await this.categoriesRepository.save(category);
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS: VALIDACIONES DE NEGOCIO
 * ====================================================================
 * 
 * 1. DIFERENCIA ENTRE VALIDACIONES:
 *    
 *    DTO (class-validator):
 *    ✓ Valida formato de datos
 *    ✓ No requiere consultas a BD
 *    ✓ Es rápido
 *    Ejemplo: "nombre debe ser string"
 *    
 *    SERVICE (lógica de negocio):
 *    ✓ Valida reglas de negocio
 *    ✓ Requiere consultas a BD
 *    ✓ Puede ser costoso
 *    Ejemplo: "nombre no debe estar duplicado"
 * 
 * 2. NOMBRES ÚNICOS:
 *    
 *    Validamos en SERVICE (no en DTO) porque:
 *    - Necesitamos consultar la BD
 *    - Es una regla de negocio, no de formato
 *    
 *    Alternativa más eficiente:
 *    En category.entity.ts podrías agregar:
 *    @Column({ unique: true })
 *    nombre: string;
 *    
 *    Esto crea un índice UNIQUE en MySQL y la BD
 *    lanza error automáticamente si hay duplicado.
 * 
 * 3. SOFT DELETE CON RELACIONES:
 *    
 *    ¿Qué pasa con los productos cuando eliminas una categoría?
 *    
 *    Escenario:
 *    Category "Electrónica" tiene 10 productos
 *    Usuario intenta eliminarla
 *    
 *    Opciones:
 *    A) Eliminar categoría y productos (CASCADE)
 *       ✗ Perdemos datos importantes
 *    
 *    B) Impedir eliminación si hay productos
 *       ✓ Esto es lo que hacemos
 *       ✓ Forzamos al usuario a tomar acción
 *    
 *    C) Mover productos a categoría "Sin categoría"
 *       ✓ Válido, pero requiere lógica adicional
 * 
 * 4. MANEJO DE ERRORES:
 *    
 *    ConflictException (409):
 *    - Nombre duplicado
 *    - Conflicto con estado actual
 *    
 *    NotFoundException (404):
 *    - Categoría no existe
 *    - Categoría inactiva
 *    
 *    BadRequestException (400):
 *    - No se puede eliminar (tiene productos)
 *    - Operación inválida por regla de negocio
 * 
 * 5. RELACIONES EN QUERIES:
 *    
 *    relations: ['products']
 *    - Trae los productos relacionados
 *    - Hace LEFT JOIN automáticamente
 *    - Solo cuando lo necesites (no siempre)
 *    
 *    ¿Cuándo usar relations?
 *    ✓ findAll: Sí (para mostrar cantidad de productos)
 *    ✓ findOne: Sí (para ver productos de la categoría)
 *    ✓ create: No (no hay productos todavía)
 *    ✓ remove: Sí (para validar productos activos)
 */
