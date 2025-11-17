/**
 * ====================================================================
 * PRODUCT.ENTITY.TS - MODELO DE PRODUCTOS
 * ====================================================================
 * 
 * Esta entidad representa los productos en el sistema.
 * Implementa una relación MANY-TO-ONE con categorías:
 * - Muchos productos pertenecen a una categoría
 * - Cada producto tiene exactamente una categoría
 * 
 * CARACTERÍSTICAS AVANZADAS:
 * - Campos numéricos con precisión decimal (precio)
 * - Eager loading de relaciones
 * - Validaciones de stock y precios
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

/**
 * Decorador @Entity - Define la tabla 'products'
 * 
 * Esta tabla almacenará todos los productos del sistema.
 */
@Entity('products')
export class Product {
  /**
   * ID - CLAVE PRIMARIA
   * ===================
   * Identificador único autogenerado para cada producto
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * NOMBRE - NOMBRE DEL PRODUCTO
   * =============================
   * 
   * Nombre descriptivo del producto.
   * Ejemplos: "Laptop Dell XPS 15", "iPhone 14 Pro", "Camisa Polo"
   * 
   * MEJORA: Agregar validaciones
   * @Column({ nullable: false, length: 200 })
   */
  @Column()
  nombre: string;

  /**
   * DESCRIPCIÓN - DESCRIPCIÓN DETALLADA
   * ====================================
   * 
   * @Column({ type: 'text', nullable: true })
   * 
   * Descripción larga y detallada del producto.
   * Puede incluir características, especificaciones, etc.
   * 
   * type: 'text' → Soporta textos largos (miles de caracteres)
   * nullable: true → Campo opcional
   * 
   * Ejemplo: "Laptop de alto rendimiento con procesador Intel i7,
   *           16GB RAM, SSD 512GB, pantalla 15.6 pulgadas Full HD"
   */
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /**
   * PRECIO - PRECIO DEL PRODUCTO
   * =============================
   * 
   * @Column({ type: 'decimal', precision: 10, scale: 2 })
   * 
   * TIPOS NUMÉRICOS CON DECIMALES:
   * 
   * type: 'decimal' → Número con precisión decimal exacta
   *   - Mejor para dinero (evita errores de redondeo de float)
   *   - Alternativas: 'numeric', 'money' (en PostgreSQL)
   * 
   * precision: 10 → Máximo 10 dígitos en total
   * scale: 2 → 2 dígitos después del punto decimal
   * 
   * RANGO PERMITIDO:
   * - Mínimo: 0.01
   * - Máximo: 99,999,999.99 (10 dígitos total, 2 decimales)
   * 
   * EJEMPLOS VÁLIDOS:
   *   ✅ 19.99
   *   ✅ 1500.50
   *   ✅ 999999.99
   * 
   * EJEMPLOS INVÁLIDOS:
   *   ❌ 999999999.99 (11 dígitos, excede precision)
   *   ❌ 19.999 (3 decimales, excede scale)
   * 
   * IMPORTANTE EN TYPESCRIPT:
   * - TypeORM lo mapea a 'number' en TypeScript
   * - En la BD se almacena como DECIMAL(10,2)
   * - Al consultar, viene como string por precisión
   * - Usar parseFloat() si necesitas operaciones matemáticas
   * 
   * SQL equivalente:
   * precio DECIMAL(10, 2) NOT NULL
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  /**
   * STOCK - CANTIDAD DISPONIBLE
   * ============================
   * 
   * @Column({ default: 0 })
   * 
   * Cantidad de unidades disponibles en inventario.
   * 
   * default: 0 → Si no se especifica, inicia en 0
   * 
   * REGLAS DE NEGOCIO COMUNES:
   * - Stock negativo = No disponible
   * - Stock 0 = Agotado
   * - Stock > 0 = Disponible
   * 
   * MEJORAS OPCIONALES:
   * - Agregar stock_minimo para alertas
   * - Agregar stock_reservado para pedidos pendientes
   * - Usar @Min(0) en el DTO para validar valores positivos
   */
  @Column({ default: 0 })
  stock: number;

  /**
   * IMAGE_URL - URL DE LA IMAGEN
   * =============================
   * 
   * @Column({ name: 'image_url', nullable: true })
   * 
   * URL donde se almacena la imagen del producto.
   * Puede ser:
   * - URL externa: "https://cdn.ejemplo.com/producto.jpg"
   * - Ruta relativa: "/uploads/productos/laptop.jpg"
   * - URL de servicio cloud: AWS S3, Cloudinary, etc.
   * 
   * nullable: true → Opcional (productos sin imagen)
   * 
   * MEJORAS:
   * - Validar formato de URL en el DTO
   * - Soportar múltiples imágenes con relación OneToMany
   * - Almacenar dimensiones y formato de la imagen
   */
  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  /**
   * IS_ACTIVE - ESTADO DEL PRODUCTO (SOFT DELETE)
   * ==============================================
   * 
   * Bandera para soft delete.
   * - true: Producto activo y visible en el catálogo
   * - false: Producto "eliminado" u oculto
   * 
   * CASOS DE USO:
   * - Productos descontinuados (mantener histórico de ventas)
   * - Productos temporalmente no disponibles
   * - Productos en revisión o moderación
   */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /**
   * CREATED_AT - FECHA DE CREACIÓN
   * ===============================
   * Timestamp de cuándo se agregó el producto al catálogo
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * UPDATED_AT - FECHA DE ÚLTIMA ACTUALIZACIÓN
   * ===========================================
   * Timestamp que se actualiza cuando cambia precio, stock, etc.
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * ====================================================================
   * RELACIÓN: MANY-TO-ONE CON CATEGORÍA
   * ====================================================================
   * 
   * @ManyToOne(() => Category, (category) => category.products, { eager: true })
   * @JoinColumn({ name: 'category_id' })
   * 
   * ¿QUÉ SIGNIFICA ESTO?
   * - MUCHOS productos pertenecen a UNA categoría
   * - Cada producto tiene exactamente una categoría
   * - Es el lado "muchos" de la relación uno-a-muchos
   * 
   * DECORADORES:
   * 
   * 1. @ManyToOne:
   *    - Primer parámetro: () => Category (entidad relacionada)
   *    - Segundo parámetro: (category) => category.products (campo inverso)
   *    - Tercer parámetro: { eager: true } (opciones)
   * 
   * 2. @JoinColumn({ name: 'category_id' }):
   *    - Define el nombre de la columna en la BD
   *    - IMPORTANTE: Este decorador crea la columna física
   *    - Sin esto, TypeORM usaría 'categoryId' (camelCase)
   *    - Con esto, usamos 'category_id' (snake_case)
   * 
   * EAGER LOADING: { eager: true }
   * ==============================
   * 
   * ¿Qué hace?
   * - Carga automáticamente la categoría al consultar productos
   * - NO necesitas especificar relations: ['category']
   * 
   * SIN eager (lazy loading):
   * ```typescript
   * // Tienes que especificar la relación
   * const product = await repository.findOne({
   *   where: { id: 1 },
   *   relations: ['category']  ← Necesario
   * });
   * ```
   * 
   * CON eager:
   * ```typescript
   * // Se carga automáticamente
   * const product = await repository.findOne({
   *   where: { id: 1 }
   *   // ¡category ya viene incluida!
   * });
   * ```
   * 
   * VENTAJAS DE EAGER:
   * ✅ Menos código (no especificar relations cada vez)
   * ✅ Consistencia (siempre tienes la categoría)
   * ✅ Menos queries N+1 accidentales
   * 
   * DESVENTAJAS:
   * ❌ Siempre hace el JOIN (incluso si no necesitas la categoría)
   * ❌ Puede impactar rendimiento en listas grandes
   * ❌ No funciona con QueryBuilder (solo con find/findOne)
   * 
   * EJEMPLO EN LA BASE DE DATOS:
   * 
   * Tabla: products
   * +----+----------+---------+-------------+
   * | id | nombre   | precio  | category_id |
   * +----+----------+---------+-------------+
   * | 1  | Laptop   | 1500.00 | 1           | ← category_id es la FK
   * | 2  | Mouse    | 25.99   | 1           |
   * | 3  | Camisa   | 35.50   | 2           |
   * +----+----------+---------+-------------+
   * 
   * Tabla: categories
   * +----+-------------+
   * | id | nombre      |
   * +----+-------------+
   * | 1  | Electrónica |
   * | 2  | Ropa        |
   * +----+-------------+
   * 
   * AL CONSULTAR (con eager):
   * GET /products/1
   * 
   * Devolverá:
   * {
   *   "id": 1,
   *   "nombre": "Laptop",
   *   "precio": 1500.00,
   *   "category": {
   *     "id": 1,
   *     "nombre": "Electrónica"
   *   }
   * }
   * 
   * SQL GENERADO (con eager):
   * SELECT 
   *   product.*, 
   *   category.id, 
   *   category.nombre
   * FROM products product
   * LEFT JOIN categories category ON product.category_id = category.id
   * WHERE product.id = 1
   */
  @ManyToOne(() => Category, (category) => category.products, {
    eager: true, // Carga automáticamente la categoría al consultar productos
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

/**
 * ====================================================================
 * 📚 CONCEPTOS AVANZADOS
 * ====================================================================
 * 
 * 1. TIPOS NUMÉRICOS EN BASES DE DATOS:
 *    
 *    DECIMAL/NUMERIC:
 *    - Precisión exacta (no hay errores de redondeo)
 *    - Ideal para dinero, precios, porcentajes
 *    - Más lento que FLOAT pero más preciso
 *    
 *    FLOAT/DOUBLE:
 *    - Precisión aproximada (puede tener errores de redondeo)
 *    - Ideal para cálculos científicos, mediciones
 *    - Más rápido pero menos preciso
 *    
 *    INTEGER:
 *    - Solo números enteros
 *    - Ideal para IDs, contadores, stock
 * 
 * 2. RELACIONES MANY-TO-ONE:
 *    - Crea una columna FK (foreign key) en esta tabla
 *    - Requiere @JoinColumn para especificar el nombre
 *    - Es el lado "propietario" de la relación
 *    - Puede usar eager loading
 * 
 * 3. EAGER VS LAZY LOADING:
 *    
 *    Eager (eager: true):
 *    ✅ Usa cuando SIEMPRE necesitas la relación
 *    ✅ Ejemplo: Producto → Categoría (casi siempre la necesitas)
 *    
 *    Lazy (eager: false o sin especificar):
 *    ✅ Usa cuando NO siempre necesitas la relación
 *    ✅ Ejemplo: Categoría → Productos (a veces no los necesitas)
 *    ✅ Especifica relations: [...] cuando los necesites
 * 
 * 4. CASCADE OPTIONS:
 *    
 *    ```typescript
 *    @ManyToOne(() => Category, { 
 *      cascade: true,           // Guarda category al guardar product
 *      onDelete: 'CASCADE'      // Elimina product si se elimina category
 *    })
 *    ```
 *    
 *    Opciones de onDelete:
 *    - CASCADE: Elimina productos si se elimina categoría
 *    - SET NULL: Pone NULL en category_id
 *    - RESTRICT: No permite eliminar categoría si tiene productos
 *    - NO ACTION: Similar a RESTRICT
 * 
 * 5. MEJORES PRÁCTICAS:
 *    ✅ Usar DECIMAL para precios (nunca FLOAT)
 *    ✅ Indexar claves foráneas para rendimiento
 *    ✅ Validar relaciones en el Service antes de guardar
 *    ✅ Documentar el impacto de eager loading
 *    ✅ Usar soft delete para mantener integridad referencial
 *    ⚠️ Cuidado con ciclos infinitos en relaciones bidireccionales
 */