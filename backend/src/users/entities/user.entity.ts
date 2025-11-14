/**
 * ====================================================================
 * USER.ENTITY.TS - MODELO DE DATOS (ENTIDAD DE BASE DE DATOS)
 * ====================================================================
 * 
 * Una Entity en TypeORM representa una TABLA en la base de datos.
 * Define la estructura de datos y cómo se mapean a columnas de BD.
 * 
 * CONCEPTOS CLAVE:
 * - Entity: Clase que representa una tabla
 * - Column: Propiedad que representa una columna
 * - Decoradores: Configuran cómo TypeORM maneja cada campo
 * 
 * Esta Entity creará la tabla 'users' con las columnas definidas abajo.
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Decorador @Entity - Define que esta clase es una entidad de TypeORM
 * 
 * @Entity('users') → Nombre de la tabla en la BD
 * Si no especificas el nombre, TypeORM usaría 'user' (minúsculas)
 * 
 * SQL equivalente al crear la tabla:
 * CREATE TABLE users (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password VARCHAR(255) NOT NULL,
 *   nombre VARCHAR(100) NOT NULL,
 *   apellido VARCHAR(255) NOT NULL,
 *   is_active BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */
@Entity('users')
export class User {
  /**
   * ID - CLAVE PRIMARIA
   * ===================
   * 
   * @PrimaryGeneratedColumn() - Crea una columna de clave primaria autoincrementable
   * 
   * Características:
   * - Es único para cada registro
   * - Se genera automáticamente (no lo especificas al crear)
   * - Es de tipo number en TypeScript, INT en MySQL
   * 
   * Ejemplo:
   * Cuando creas un usuario, no envías el ID:
   * { email: "...", password: "...", nombre: "..." }
   * 
   * Después de guardarlo, TypeORM asigna el ID automáticamente:
   * { id: 1, email: "...", password: "...", nombre: "..." }
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * EMAIL - IDENTIFICADOR ÚNICO DEL USUARIO
   * =======================================
   * 
   * @Column({ unique: true }) - Columna con restricción de unicidad
   * 
   * Características:
   * - unique: true → No puede haber dos usuarios con el mismo email
   * - TypeORM crea un índice único en la BD
   * - Si intentas insertar un email duplicado, la BD lanza error
   * 
   * Tipo de datos:
   * - TypeScript: string
   * - MySQL: VARCHAR(255) por defecto
   * 
   * Importante: La validación de formato (email válido) se hace en el DTO,
   * aquí solo definimos que debe ser único.
   */
  @Column({ unique: true })
  email: string;

  /**
   * PASSWORD - CONTRASEÑA HASHEADA
   * ================================
   * 
   * @Column({ type: 'varchar'}) - Columna de tipo VARCHAR
   * 
   * ⚠️ SEGURIDAD IMPORTANTE:
   * - Este campo NUNCA debe almacenar contraseñas en texto plano
   * - Siempre debe contener el hash de bcrypt
   * - El hash de bcrypt siempre tiene 60 caracteres
   * 
   * Ejemplo de hash:
   * "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ"
   * 
   * Para ocultar este campo en las respuestas, considera:
   * @Column({ type: 'varchar', select: false })
   */
  @Column({ type: 'varchar'})
  password: string;

  /**
   * NOMBRE - PRIMER NOMBRE DEL USUARIO
   * ====================================
   * 
   * @Column({ type: 'varchar', length: 100 }) - VARCHAR con longitud máxima
   * 
   * Parámetros:
   * - type: 'varchar' → Tipo de dato en la BD
   * - length: 100 → Máximo 100 caracteres
   * 
   * En MySQL será: VARCHAR(100)
   * En TypeScript es: string
   * 
   * Validación adicional (en el DTO):
   * - No vacío (@IsNotEmpty)
   * - Solo texto (@IsString)
   * - Longitud mínima/máxima (@MinLength, @MaxLength)
   */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /**
   * APELLIDO - APELLIDO DEL USUARIO
   * =================================
   * 
   * @Column() - Columna simple sin opciones adicionales
   * 
   * Por defecto TypeORM usa:
   * - type: varchar (inferido del tipo TypeScript string)
   * - length: 255 (longitud por defecto de VARCHAR)
   * - nullable: false (no puede ser NULL)
   * 
   * En MySQL será: VARCHAR(255) NOT NULL
   */
  @Column()
  apellido: string;

  /**
   * IS_ACTIVE - BANDERA DE SOFT DELETE
   * ====================================
   * 
   * @Column({ name: 'is_active', default: true }) - Columna con nombre custom
   * 
   * Parámetros:
   * - name: 'is_active' → Nombre de la columna en la BD (snake_case)
   * - default: true → Valor por defecto al crear registros
   * 
   * Uso:
   * - true: Usuario activo (puede usarse normalmente)
   * - false: Usuario "eliminado" (soft delete)
   * 
   * Ventaja del soft delete:
   * - Los datos no se pierden
   * - Puedes reactivar usuarios
   * - Mantienes historial para auditoría
   * 
   * Mapeo:
   * - TypeScript: isActive (camelCase)
   * - MySQL: is_active (snake_case)
   */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /**
   * CREATED_AT - FECHA DE CREACIÓN
   * ===============================
   * 
   * @CreateDateColumn - Timestamp que se establece automáticamente al CREAR
   * 
   * Parámetros:
   * - name: 'created_at' → Nombre en la BD
   * - type: 'timestamp' → Tipo de dato temporal
   * 
   * Comportamiento:
   * - Se establece automáticamente cuando creas el registro
   * - NO se actualiza en updates posteriores
   * - No necesitas especificarlo al crear usuarios
   * 
   * TypeORM genera:
   * created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * 
   * Ejemplo:
   * Creas usuario a las 10:30 AM → createdAt = "2025-11-14T10:30:00.000Z"
   * Actualizas a las 2:00 PM → createdAt sigue siendo "2025-11-14T10:30:00.000Z"
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  /**
   * UPDATED_AT - FECHA DE ÚTLTIMA MODIFICACIÓN
   * ==========================================
   * 
   * @UpdateDateColumn - Timestamp que se actualiza automáticamente en cada SAVE
   * 
   * Parámetros:
   * - name: 'updated_at' → Nombre en la BD
   * - type: 'timestamp' → Tipo de dato temporal
   * 
   * Comportamiento:
   * - Se establece automáticamente cuando creas el registro
   * - Se ACTUALIZA automáticamente en cada save() posterior
   * - No necesitas modificarlo manualmente
   * 
   * TypeORM genera:
   * updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   * 
   * Ejemplo:
   * Creas usuario a las 10:30 AM → updatedAt = "2025-11-14T10:30:00.000Z"
   * Actualizas a las 2:00 PM → updatedAt = "2025-11-14T14:00:00.000Z"
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

/**
 * ====================================================================
 * 📚 CONCEPTOS IMPORTANTES DE TYPEORM
 * ====================================================================
 * 
 * 1. DECORADORES DE COLUMNAS:
 *    @Column() - Columna estándar
 *    @PrimaryColumn() - Clave primaria manual
 *    @PrimaryGeneratedColumn() - Clave primaria autogenerada
 *    @CreateDateColumn() - Timestamp de creación
 *    @UpdateDateColumn() - Timestamp de actualización
 *    @DeleteDateColumn() - Para soft delete automático de TypeORM
 * 
 * 2. OPCIONES DE @Column():
 *    - type: Tipo de BD ('varchar', 'int', 'boolean', 'timestamp', etc.)
 *    - length: Longitud máxima (para strings)
 *    - nullable: Permite NULL (default: false)
 *    - unique: Debe ser único (crea índice)
 *    - default: Valor por defecto
 *    - name: Nombre de la columna en BD (si difiere del property)
 *    - select: Si se incluye por defecto en queries (default: true)
 * 
 * 3. TIPOS DE DATOS COMUNES:
 *    TypeScript → MySQL
 *    - string → VARCHAR(255)
 *    - number → INT
 *    - boolean → TINYINT(1) o BOOLEAN
 *    - Date → TIMESTAMP o DATETIME
 * 
 * 4. CONVENCIONES DE NOMBRES:
 *    - Entity class: PascalCase (User, Product, Order)
 *    - Properties: camelCase (firstName, isActive, createdAt)
 *    - Tabla BD: snake_case (users, products, orders)
 *    - Columnas BD: snake_case (first_name, is_active, created_at)
 * 
 * 5. RELACIONES (para futuro):
 *    @OneToOne() - Uno a uno (User ↔ Profile)
 *    @OneToMany() - Uno a muchos (User → Posts)
 *    @ManyToOne() - Muchos a uno (Posts → User)
 *    @ManyToMany() - Muchos a muchos (Students ↔ Courses)
 * 
 * 6. ÍNDICES Y OPTIMIZACIÓN:
 *    @Index() - Crea índice para búsquedas rápidas
 *    unique: true - Crea índice único
 *    Las claves primarias siempre tienen índice
 * 
 * 7. BUENAS PRÁCTICAS:
 *    ✓ Usa timestamps (createdAt, updatedAt) en todas las entities
 *    ✓ Implementa soft delete con isActive en lugar de borrar
 *    ✓ Usa unique: true para campos que deben ser únicos
 *    ✓ Define longitudes apropiadas para strings
 *    ✓ Documenta el propósito de cada campo
 *    ✗ No almacenes datos sensibles sin encriptar
 *    ✗ No uses sincronización automática en producción
 */