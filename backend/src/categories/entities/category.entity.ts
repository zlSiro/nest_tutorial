/**
 * ====================================================================
 * CATEGORY.ENTITY.TS - MODELO DE CATEGORÍAS DE PRODUCTOS
 * ====================================================================
 * 
 * Esta entidad representa las categorías que agrupan productos.
 * Implementa una relación ONE-TO-MANY con productos:
 * - Una categoría puede tener muchos productos
 * - Un producto pertenece a una sola categoría
 * 
 * NUEVA CARACTERÍSTICA: RELACIONES ENTRE TABLAS
 * Las relaciones permiten conectar datos entre diferentes tablas,
 * evitando duplicación y manteniendo integridad referencial.
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * Decorador @Entity - Define la tabla 'categories'
 * 
 * Esta tabla almacenará las categorías de productos.
 * Ejemplo: Electrónica, Ropa, Alimentos, etc.
 */
@Entity('categories')
export class Category {
  /**
   * ID - CLAVE PRIMARIA
   * ===================
   * Identificador único autogenerado para cada categoría
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * NOMBRE - NOMBRE DE LA CATEGORÍA
   * ================================
   * 
   * @Column({ nullable: false }) - Campo obligatorio (NOT NULL)
   * 
   * El nombre debe ser único y descriptivo.
   * Ejemplos: "Electrónica", "Ropa", "Alimentos", "Libros"
   * 
   */
  @Column({ nullable: false, unique: true })
  nombre: string;

  /**
   * DESCRIPCIÓN - DESCRIPCIÓN DE LA CATEGORÍA
   * ==========================================
   * 
   * @Column({ type: 'text', nullable: true }) - Campo opcional de texto largo
   * 
   * type: 'text' → Permite textos largos (más de 255 caracteres)
   * nullable: true → Puede ser NULL (opcional)
   * 
   * Ejemplo: "Productos electrónicos como laptops, celulares, tablets, etc."
   * 
   * Mapeo SQL:
   * - MySQL: TEXT
   * - PostgreSQL: TEXT
   */
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /**
   * IS_ACTIVE - ESTADO DE LA CATEGORÍA (SOFT DELETE)
   * =================================================
   * 
   * Bandera para implementar soft delete.
   * - true: Categoría activa y visible
   * - false: Categoría "eliminada" (oculta)
   * 
   * IMPORTANTE: Al eliminar una categoría, primero se debe verificar
   * que no tenga productos activos asociados.
   */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /**
   * CREATED_AT - FECHA DE CREACIÓN
   * ===============================
   * Timestamp automático de cuándo se creó la categoría
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * UPDATED_AT - FECHA DE ÚLTIMA ACTUALIZACIÓN
   * ===========================================
   * Timestamp automático que se actualiza en cada modificación
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * ====================================================================
   * RELACIÓN: ONE-TO-MANY CON PRODUCTOS
   * ====================================================================
   * 
   * @OneToMany(() => Product, (product) => product.category)
   * 
   * ¿QUÉ SIGNIFICA ESTO?
   * - Una categoría puede tener MUCHOS productos
   * - Cada producto en el array pertenece a esta categoría
   * 
   * PARÁMETROS:
   * 1. () => Product: Especifica la entidad relacionada (Product)
   * 2. (product) => product.category: El campo inverso en Product
   * 
   * EJEMPLO EN LA BASE DE DATOS:
   * 
   * Tabla: categories
   * +----+-------------+
   * | id | nombre      |
   * +----+-------------+
   * | 1  | Electrónica |
   * | 2  | Ropa        |
   * +----+-------------+
   * 
   * Tabla: products
   * +----+----------+-------------+
   * | id | nombre   | category_id |
   * +----+----------+-------------+
   * | 1  | Laptop   | 1           |  ← Pertenece a Electrónica
   * | 2  | Mouse    | 1           |  ← Pertenece a Electrónica
   * | 3  | Camisa   | 2           |  ← Pertenece a Ropa
   * +----+----------+-------------+
   * 
   * AL CONSULTAR:
   * GET /categories/1 con relations: ['products']
   * 
   * Devolverá:
   * {
   *   "id": 1,
   *   "nombre": "Electrónica",
   *   "products": [
   *     { "id": 1, "nombre": "Laptop" },
   *     { "id": 2, "nombre": "Mouse" }
   *   ]
   * }
   * 
   * IMPORTANTE:
   * - Esta relación NO crea una columna en la tabla categories
   * - La columna category_id está en la tabla products
   * - Para cargar los productos, debes especificar relations: ['products']
   * - O usar eager: true en el decorador @ManyToOne del lado de Product
   */
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

/**
 * ====================================================================
 * 📚 CONCEPTOS DE RELACIONES EN TYPEORM
 * ====================================================================
 * 
 * 1. TIPOS DE RELACIONES:
 *    - @OneToOne: Uno a uno (User ↔ Profile)
 *    - @OneToMany: Uno a muchos (Category → Products)
 *    - @ManyToOne: Muchos a uno (Products → Category)
 *    - @ManyToMany: Muchos a muchos (Students ↔ Courses)
 * 
 * 2. RELACIÓN ONE-TO-MANY:
 *    - Se define en el lado "uno" (Category)
 *    - No crea columnas en esta tabla
 *    - Es bidireccional con @ManyToOne
 *    - Devuelve un array de entidades relacionadas
 * 
 * 3. CARGANDO RELACIONES:
 *    
 *    Opción A: Especificar en la query
 *    ```typescript
 *    const category = await repository.findOne({
 *      where: { id: 1 },
 *      relations: ['products']
 *    });
 *    ```
 * 
 *    Opción B: Usar eager loading (en @ManyToOne del otro lado)
 *    Se carga automáticamente sin especificar relations
 * 
 * 4. CASCADE Y OPCIONES:
 *    - cascade: true → Guarda/actualiza/elimina automáticamente
 *    - onDelete: 'CASCADE' → Elimina productos si se elimina categoría
 *    - onDelete: 'SET NULL' → Pone NULL en products.category_id
 *    - onDelete: 'RESTRICT' → No permite eliminar si tiene productos
 * 
 * 5. MEJORES PRÁCTICAS:
 *    ✅ Validar antes de eliminar una categoría con productos
 *    ✅ Usar soft delete en lugar de eliminación física
 *    ✅ Indexar claves foráneas para mejor rendimiento
 *    ✅ Documentar las relaciones en ambos lados
 *    ⚠️ Cuidado con N+1 queries (usar eager o join)
 */