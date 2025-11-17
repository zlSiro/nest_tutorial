/**
 * ====================================================================
 * PRODUCTS.SERVICE.TS - SERVICIO DE LÓGICA DE NEGOCIO PARA PRODUCTOS
 * ====================================================================
 * 
 * Este servicio es más complejo que CategoriesService porque:
 * 1. Maneja relaciones con categorías (FOREIGN KEY)
 * 2. Valida la existencia de categorías antes de crear/actualizar
 * 3. Tiene un endpoint adicional: findByCategory
 * 
 * RESPONSABILIDADES:
 * 1. Crear productos (validando que la categoría exista)
 * 2. Listar todos los productos activos (con sus categorías)
 * 3. Listar productos de una categoría específica
 * 4. Buscar un producto por ID
 * 5. Actualizar productos (validando categoría si cambia)
 * 6. Eliminar productos (soft delete)
 * 
 * VALIDACIONES DE NEGOCIO:
 * - La categoría debe existir y estar activa
 * - Solo trabajar con productos activos (isActive = true)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  /**
   * CONSTRUCTOR - INYECCIÓN DE DEPENDENCIAS MÚLTIPLES
   * ==================================================
   * 
   * A diferencia de CategoriesService que solo inyecta UN repositorio,
   * aquí inyectamos DOS:
   * 
   * 1. productsRepository - Para operaciones con productos
   * 2. categoriesRepository - Para validar categorías
   * 
   * ¿Por qué necesitamos categoriesRepository?
   * - Para validar que la categoría existe antes de crear/actualizar
   * - No podemos confiar solo en el categoryId del DTO
   * - Necesitamos la entidad Category completa para la relación
   * 
   * IMPORTANTE:
   * Para inyectar Category repository, necesitamos:
   * - Importar CategoryEntity: import { Category } from '...'
   * - Que ProductsModule importe TypeOrmModule.forFeature([Category])
   *   (Esto lo veremos en products.module.ts)
   */
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * ====================================================================
   * CREATE - CREAR UN NUEVO PRODUCTO
   * ====================================================================
   * 
   * Este método es el más complejo del servicio porque:
   * 1. Valida que la categoría exista
   * 2. Separa categoryId del DTO (no es parte de Product entity)
   * 3. Asigna la entidad Category completa (relación)
   * 4. Crea y guarda el producto
   * 
   * @param createProductDto - Datos del nuevo producto
   * @returns Promise<Product> - El producto creado con su categoría
   * @throws NotFoundException - Si la categoría no existe
   * 
   * FLUJO:
   * 1. Buscar la categoría por ID
   * 2. Si no existe, lanzar excepción
   * 3. Separar categoryId del DTO
   * 4. Crear producto con la entidad Category
   * 5. Guardar y retornar
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    /**
     * PASO 1: VALIDAR QUE LA CATEGORÍA EXISTA
     * ========================================
     * 
     * ¿Por qué validar?
     * - El DTO valida que categoryId sea un número positivo
     * - Pero no valida que EXISTA en la BD
     * - Necesitamos prevenir productos con categorías inválidas
     * 
     * findOne({ where: { id: ..., isActive: true } })
     * - Busca la categoría por ID
     * - Solo categorías activas
     * - Retorna null si no existe
     * 
     * SQL Equivalente:
     * SELECT * FROM categories
     * WHERE id = 1 AND isActive = true
     * LIMIT 1;
     */
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${createProductDto.categoryId} no encontrada`,
      );
    }

    /**
     * PASO 2: SEPARAR categoryId DEL DTO
     * ===================================
     * 
     * ¿Por qué hacer esto?
     * 
     * createProductDto contiene:
     * {
     *   nombre: "Laptop",
     *   precio: 1299.99,
     *   stock: 10,
     *   categoryId: 1  ← Este campo NO existe en Product entity
     * }
     * 
     * Product entity tiene:
     * - nombre, precio, stock, etc.
     * - category (relación @ManyToOne)
     * - NO tiene categoryId como propiedad
     * 
     * Necesitamos:
     * 1. Extraer categoryId
     * 2. Usar los demás campos (productData)
     * 3. Asignar la entidad Category completa
     * 
     * DESTRUCTURING:
     * const { categoryId, ...productData } = createProductDto;
     * 
     * categoryId = 1
     * productData = {
     *   nombre: "Laptop",
     *   precio: 1299.99,
     *   stock: 10,
     *   descripcion: "...",
     *   imageUrl: "..."
     * }
     */
    const { categoryId, ...productData } = createProductDto;

    /**
     * PASO 3: CREAR LA ENTIDAD PRODUCTO
     * ==================================
     * 
     * create({
     *   ...productData,  ← Expande nombre, precio, stock, etc.
     *   category         ← Asigna la entidad Category completa
     * })
     * 
     * Esto genera:
     * Product {
     *   nombre: "Laptop",
     *   precio: 1299.99,
     *   stock: 10,
     *   category: Category { id: 1, nombre: "Electrónica", ... },
     *   isActive: true,
     *   createdAt: undefined,
     *   updatedAt: undefined
     * }
     * 
     * IMPORTANTE:
     * Asignamos la ENTIDAD Category completa, no solo el ID.
     * TypeORM se encarga de:
     * 1. Extraer el category.id
     * 2. Guardarlo en la columna category_id (FK)
     * 3. Mantener la relación
     */
    const product = this.productsRepository.create({
      ...productData,
      category, // Asignar la relación
    });

    /**
     * PASO 4: GUARDAR EN LA BASE DE DATOS
     * ====================================
     * 
     * save() ejecuta:
     * INSERT INTO products
     * (nombre, descripcion, precio, stock, imageUrl, category_id, isActive, createdAt, updatedAt)
     * VALUES
     * ('Laptop', '...', 1299.99, 10, '...', 1, true, NOW(), NOW());
     * 
     * Note que category_id = 1 (se extrae de category.id)
     * 
     * EAGER LOADING:
     * Gracias a eager: true en product.entity.ts,
     * el producto retornado incluirá la categoría automáticamente:
     * 
     * {
     *   id: 1,
     *   nombre: "Laptop",
     *   precio: "1299.99",
     *   stock: 10,
     *   category: {
     *     id: 1,
     *     nombre: "Electrónica",
     *     descripcion: "Productos electrónicos",
     *     isActive: true
     *   }
     * }
     */
    return await this.productsRepository.save(product);
  }

  /**
   * ====================================================================
   * FIND ALL - OBTENER TODOS LOS PRODUCTOS ACTIVOS
   * ====================================================================
   * 
   * Este método:
   * 1. Busca todos los productos activos
   * 2. Incluye sus categorías (aunque eager: true ya lo hace)
   * 
   * @returns Promise<Product[]> - Array de productos con categorías
   */
  async findAll(): Promise<Product[]> {
    /**
     * find()
     * ======
     * Busca múltiples registros.
     * 
     * where: { isActive: true }
     * - Solo productos activos (soft delete)
     * 
     * relations: ['category']
     * - Redundante porque eager: true en entity
     * - Lo dejamos explícito para claridad
     * - No afecta el performance (no hace doble query)
     * 
     * SQL Equivalente:
     * SELECT p.*, c.*
     * FROM products p
     * INNER JOIN categories c ON p.category_id = c.id
     * WHERE p.isActive = true;
     * 
     * NOTA:
     * Es INNER JOIN (no LEFT JOIN) porque:
     * - Todo producto DEBE tener categoría
     * - @ManyToOne sin { nullable: true }
     * - category_id es NOT NULL en la BD
     */
    return await this.productsRepository.find({
      where: { isActive: true },
      relations: ['category'], // Ya está en eager, pero lo dejamos explícito
    });
  }

  /**
   * ====================================================================
   * FIND BY CATEGORY - OBTENER PRODUCTOS DE UNA CATEGORÍA
   * ====================================================================
   * 
   * Este método es ÚNICO de productos (no existe en categorías).
   * Permite filtrar productos por categoría.
   * 
   * @param categoryId - ID de la categoría
   * @returns Promise<Product[]> - Productos de esa categoría
   * 
   * CASO DE USO:
   * GET /products?categoryId=1
   * Retorna todos los productos de la categoría "Electrónica"
   */
  async findByCategory(categoryId: number): Promise<Product[]> {
    /**
     * FILTRO POR RELACIÓN
     * ===================
     * 
     * where: {
     *   category: { id: categoryId },  ← Filtrar por ID de categoría
     *   isActive: true                  ← Solo activos
     * }
     * 
     * Esto es equivalente a:
     * SELECT p.*, c.*
     * FROM products p
     * INNER JOIN categories c ON p.category_id = c.id
     * WHERE c.id = 1 AND p.isActive = true;
     * 
     * TypeORM entiende que category es una relación
     * y genera el JOIN automáticamente.
     * 
     * ALTERNATIVA (menos elegante):
     * where: {
     *   category: { id: categoryId }
     * }
     * 
     * Pero usar categoryId directamente no funciona porque
     * category_id es una columna de base de datos, no una
     * propiedad de TypeScript en la entidad.
     * 
     * NOTA IMPORTANTE:
     * No validamos si la categoría existe.
     * Si categoryId no existe, retorna array vacío [].
     * Esto es intencional: "no hay productos" es válido.
     */
    return await this.productsRepository.find({
      where: {
        category: { id: categoryId },
        isActive: true,
      },
    });
  }

  /**
   * ====================================================================
   * FIND ONE - BUSCAR UN PRODUCTO POR ID
   * ====================================================================
   * 
   * Este método:
   * 1. Busca un producto activo por ID
   * 2. Incluye su categoría
   * 3. Lanza excepción si no existe
   * 
   * @param id - ID del producto
   * @returns Promise<Product> - El producto encontrado
   * @throws NotFoundException - Si no existe o no está activo
   */
  async findOne(id: number): Promise<Product> {
    /**
     * findOne()
     * =========
     * Busca UN producto por ID.
     * 
     * where: { id, isActive: true }
     * - Por ID Y activo
     * 
     * relations: ['category']
     * - Redundante por eager: true
     * - Lo dejamos por claridad
     * 
     * SQL Equivalente:
     * SELECT p.*, c.*
     * FROM products p
     * INNER JOIN categories c ON p.category_id = c.id
     * WHERE p.id = 1 AND p.isActive = true;
     */
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  /**
   * ====================================================================
   * UPDATE - ACTUALIZAR UN PRODUCTO
   * ====================================================================
   * 
   * Este método es complejo porque:
   * 1. Permite actualizar la categoría
   * 2. Valida la nueva categoría si cambia
   * 3. Maneja categoryId vs category entity
   * 
   * @param id - ID del producto a actualizar
   * @param updateProductDto - Campos a actualizar
   * @returns Promise<Product> - El producto actualizado
   * @throws NotFoundException - Si producto o categoría no existe
   * 
   * CASOS:
   * A) Actualizar sin cambiar categoría
   * B) Actualizar cambiando categoría
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    /**
     * PASO 1: VERIFICAR QUE EL PRODUCTO EXISTA
     * =========================================
     * 
     * Reutilizamos findOne() que valida existencia.
     */
    const product = await this.findOne(id);

    /**
     * PASO 2: VALIDAR NUEVA CATEGORÍA (SI SE ACTUALIZA)
     * ==================================================
     * 
     * Solo si updateProductDto.categoryId está presente:
     * 1. Buscar la nueva categoría
     * 2. Validar que exista y esté activa
     * 3. Separar categoryId del DTO
     * 4. Asignar la entidad Category completa
     * 
     * ¿Por qué este if separado?
     * Porque si NO se actualiza la categoría,
     * no necesitamos validarla ni hacer query adicional.
     * 
     * CASO A: ACTUALIZAR CATEGORÍA
     * =============================
     */
    if (updateProductDto.categoryId) {
      /**
       * Buscar la nueva categoría
       */
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${updateProductDto.categoryId} no encontrada`,
        );
      }

      /**
       * Separar categoryId y actualizar con category entity
       * 
       * const { categoryId, ...productData } = updateProductDto;
       * - Extrae categoryId (no lo usamos más)
       * - productData tiene el resto de campos
       * 
       * Object.assign(product, { ...productData, category })
       * - Actualiza campos de productData
       * - Actualiza category con la entidad completa
       * 
       * Ejemplo:
       * updateProductDto = { precio: 1199.99, categoryId: 2 }
       * 
       * Después de destructuring:
       * productData = { precio: 1199.99 }
       * 
       * Object.assign actualiza:
       * product.precio = 1199.99
       * product.category = Category { id: 2, nombre: "Nueva categoría", ... }
       */
      const { categoryId, ...productData } = updateProductDto;
      Object.assign(product, { ...productData, category });
    } else {
      /**
       * CASO B: NO ACTUALIZAR CATEGORÍA
       * ================================
       * 
       * Si categoryId NO está en updateProductDto:
       * - No validamos categoría
       * - No hacemos query adicional
       * - Solo actualizamos otros campos
       * 
       * Ejemplo:
       * updateProductDto = { precio: 1199.99, stock: 8 }
       * 
       * Object.assign actualiza solo precio y stock:
       * product.precio = 1199.99
       * product.stock = 8
       * product.category NO cambia
       */
      Object.assign(product, updateProductDto);
    }

    /**
     * PASO 3: GUARDAR CAMBIOS
     * ========================
     * 
     * save() detecta que la entidad existe y hace UPDATE:
     * 
     * Si se actualizó categoría:
     * UPDATE products
     * SET precio = 1199.99, category_id = 2, updatedAt = NOW()
     * WHERE id = 1;
     * 
     * Si NO se actualizó categoría:
     * UPDATE products
     * SET precio = 1199.99, stock = 8, updatedAt = NOW()
     * WHERE id = 1;
     * 
     * EAGER LOADING:
     * El producto retornado incluye la categoría actualizada
     * automáticamente.
     */
    return await this.productsRepository.save(product);
  }

  /**
   * ====================================================================
   * REMOVE - ELIMINAR UN PRODUCTO (SOFT DELETE)
   * ====================================================================
   * 
   * Este método:
   * 1. Busca el producto (valida que exista)
   * 2. Marca como inactivo (soft delete)
   * 
   * @param id - ID del producto a eliminar
   * @returns Promise<void>
   * @throws NotFoundException - Si el producto no existe
   * 
   * NOTA:
   * No necesitamos validaciones adicionales como en categorías.
   * Un producto puede eliminarse sin restricciones.
   */
  async remove(id: number): Promise<void> {
    /**
     * PASO 1: VERIFICAR EXISTENCIA
     * =============================
     * 
     * findOne() valida que el producto:
     * - Exista
     * - Esté activo
     * - Lanza excepción si no
     */
    const product = await this.findOne(id);

    /**
     * PASO 2: SOFT DELETE
     * ===================
     * 
     * Marcar como inactivo en lugar de DELETE:
     * UPDATE products
     * SET isActive = false, updatedAt = NOW()
     * WHERE id = 1;
     * 
     * VENTAJAS:
     * 1. No perdemos datos
     * 2. La categoría mantiene referencia (integridad)
     * 3. Auditoría completa
     * 4. Se puede recuperar
     * 
     * IMPACTO EN LA CATEGORÍA:
     * Cuando hacemos GET /categories/1:
     * - La categoría sigue existiendo
     * - Sus productos inactivos NO aparecen (filtrados por isActive)
     * - Total de productos activos disminuye
     */
    product.isActive = false;
    await this.productsRepository.save(product);
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS: MANEJO DE RELACIONES
 * ====================================================================
 * 
 * 1. INYECTAR MÚLTIPLES REPOSITORIOS:
 *    
 *    constructor(
 *      @InjectRepository(Product) productsRepo,
 *      @InjectRepository(Category) categoriesRepo  ← Adicional
 *    )
 *    
 *    ¿Cuándo inyectar repositorios de otras entidades?
 *    ✓ Para validar relaciones (categoryId existe)
 *    ✓ Para queries complejas entre tablas
 *    ✓ Para obtener entidades relacionadas completas
 * 
 * 2. categoryId VS category ENTITY:
 *    
 *    DTO:
 *    { categoryId: 1 }  ← Cliente envía ID
 *    
 *    Entity:
 *    {
 *      category: Category { id: 1, nombre: "..." }  ← BD necesita entidad
 *    }
 *    
 *    CONVERSIÓN:
 *    1. Extraer categoryId del DTO
 *    2. Buscar Category entity en BD
 *    3. Asignar entity completa al producto
 *    4. TypeORM extrae category.id para la FK
 * 
 * 3. EAGER LOADING:
 *    
 *    En product.entity.ts:
 *    @ManyToOne(() => Category, { eager: true })
 *    
 *    SIEMPRE trae la categoría automáticamente:
 *    - findOne() → Producto con categoría
 *    - find() → Productos con categorías
 *    - save() → Producto guardado con categoría
 *    
 *    relations: ['category'] es REDUNDANTE pero:
 *    - Hace el código más explícito
 *    - No afecta performance
 *    - Documenta la intención
 * 
 * 4. FILTRAR POR RELACIÓN:
 *    
 *    where: {
 *      category: { id: categoryId }  ← Filtrar por FK
 *    }
 *    
 *    TypeORM entiende que category es relación y genera:
 *    JOIN categories ON products.category_id = categories.id
 *    WHERE categories.id = 1
 *    
 *    ALTERNATIVA (no recomendada):
 *    where: 'product.category_id = :id'
 *    
 *    Usar el objeto where con relaciones es más limpio.
 * 
 * 5. ACTUALIZAR RELACIONES:
 *    
 *    OPCIÓN 1 (lo que usamos):
 *    Object.assign(product, { category: newCategory })
 *    
 *    OPCIÓN 2:
 *    product.category = newCategory;
 *    
 *    OPCIÓN 3 (NO FUNCIONA):
 *    product.categoryId = 2;  ✗ categoryId no existe
 *    
 *    Siempre asignar la ENTIDAD completa, no el ID.
 * 
 * 6. VALIDACIONES EN CASCADA:
 *    
 *    Al crear producto:
 *    DTO → Valida formato de categoryId (número positivo)
 *    Service → Valida existencia de categoría en BD
 *    Entity → Define la relación (@ManyToOne)
 *    BD → Valida FK constraint (category_id existe en categories)
 *    
 *    Múltiples capas de validación previenen errores.
 * 
 * 7. QUERIES ADICIONALES:
 *    
 *    findByCategory es un ejemplo de query personalizado.
 *    
 *    Otros ejemplos útiles:
 *    
 *    findByPriceRange(min, max):
 *    where: {
 *      precio: Between(min, max),
 *      isActive: true
 *    }
 *    
 *    findOutOfStock():
 *    where: {
 *      stock: 0,
 *      isActive: true
 *    }
 *    
 *    findByCategoryAndPrice(categoryId, maxPrice):
 *    where: {
 *      category: { id: categoryId },
 *      precio: LessThanOrEqual(maxPrice),
 *      isActive: true
 *    }
 */