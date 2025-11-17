/**
 * ====================================================================
 * PRODUCTS.MODULE.TS - MÓDULO DE PRODUCTOS
 * ====================================================================
 * 
 * Este módulo encapsula toda la funcionalidad de productos:
 * - Entity (Product)
 * - Service (ProductsService)
 * - Controller (ProductsController)
 * 
 * DIFERENCIA CON CategoriesModule:
 * Importa CategoriesModule para acceder al repositorio de Category.
 * Esto permite validar que las categorías existan al crear/actualizar productos.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';

/**
 * @Module()
 * =========
 * Define el módulo de productos con sus dependencias.
 */
@Module({
  /**
   * IMPORTS - MÓDULOS IMPORTADOS
   * ===============================
   */
  imports: [
    /**
     * TypeOrmModule.forFeature([Product])
     * ===================================
     * 
     * ¿QUÉ HACE?
     * - Registra la entidad Product en TypeORM
     * - Crea el repositorio Repository<Product>
     * - Permite inyectar el repositorio en ProductsService:
     *   @InjectRepository(Product)
     *   private productsRepository: Repository<Product>
     * 
     * Esto es necesario para:
     * - productsService.create() - Guardar productos
     * - productsService.find() - Listar productos
     * - productsService.update() - Actualizar productos
     * - productsService.remove() - Eliminar productos
     */
    TypeOrmModule.forFeature([Product]),

    /**
     * CategoriesModule
     * ================
     * 
     * ¿POR QUÉ IMPORTAR CategoriesModule?
     * - ProductsService necesita validar que las categorías existan
     * - Usa @InjectRepository(Category) para acceder al repositorio
     * - CategoriesModule exporta TypeOrmModule con Category
     * 
     * Sin esta importación:
     * ProductsService → @InjectRepository(Category) → ERROR
     * "Nest can't resolve dependencies of the ProductsService"
     * 
     * Con esta importación:
     * ProductsService puede inyectar Repository<Category> porque:
     * 1. CategoriesModule importa TypeOrmModule.forFeature([Category])
     * 2. CategoriesModule exporta TypeOrmModule
     * 3. ProductsModule importa CategoriesModule
     * 4. ProductsService puede usar @InjectRepository(Category)
     * 
     * FLUJO DE DEPENDENCIAS:
     * 
     * CategoriesModule:
     * ┌──────────────────────────────┐
     * │ imports: [TypeOrmModule     │
     * │   .forFeature([Category])]  │ ← Registra Category
     * │                              │
     * │ exports: [TypeOrmModule]    │ ← Comparte el repositorio
     * └──────────────────────────────┘
     *           │
     *           │ exports TypeOrmModule
     *           │
     *           ↓
     * ProductsModule:
     * ┌──────────────────────────────┐
     * │ imports: [                 │
     * │   TypeOrmModule            │
     * │     .forFeature([Product]),│ ← Registra Product
     * │   CategoriesModule         │ ← Recibe Category repo
     * │ ]                           │
     * └──────────────────────────────┘
     *           │
     *           │ Ahora tiene acceso a:
     *           │ - Repository<Product>
     *           │ - Repository<Category>
     *           │
     *           ↓
     * ProductsService:
     * ┌────────────────────────────────────────┐
     * │ constructor(                        │
     * │   @InjectRepository(Product)        │ ← OK
     * │   productsRepo,                     │
     * │                                      │
     * │   @InjectRepository(Category)       │ ← OK gracias a
     * │   categoriesRepo                    │    CategoriesModule
     * │ )                                    │
     * └────────────────────────────────────────┘
     * 
     * CASOS DE USO:
     * 
     * 1. Crear producto:
     *    - Validar que categoryId exista
     *    - Usar categoriesRepository.findOne()
     *    - Si existe, crear producto con category relation
     * 
     * 2. Actualizar producto:
     *    - Si cambia categoryId
     *    - Validar que nueva categoría exista
     *    - Usar categoriesRepository.findOne()
     * 
     * 3. Listar productos:
     *    - Eager loading trae categorías automáticamente
     *    - No necesita categoriesRepository
     *    - Pero la relación existe por el import
     */
    CategoriesModule, // Importar para acceder al repositorio de Category
  ],

  /**
   * CONTROLLERS - CONTROLADORES DEL MÓDULO
   * ========================================
   * 
   * [ProductsController]
   * - Define los endpoints HTTP para productos
   * - POST /products
   * - GET /products (con filtro opcional ?categoryId=1)
   * - GET /products/:id
   * - PATCH /products/:id
   * - DELETE /products/:id
   */
  controllers: [ProductsController],

  /**
   * PROVIDERS - SERVICIOS DEL MÓDULO
   * ==================================
   * 
   * [ProductsService]
   * - Lógica de negocio para productos
   * - Validación de categorías
   * - Manejo de relaciones
   * - CRUD completo
   */
  providers: [ProductsService],

  /**
   * EXPORTS - QUÉ COMPARTIR CON OTROS MÓDULOS
   * ============================================
   * 
   * [ProductsService]
   * =================
   * 
   * Exportamos ProductsService por si otros módulos lo necesitan.
   * 
   * Casos de uso:
   * 
   * 1. OrdersModule (futuro):
   *    - Necesita validar que productos existan
   *    - Necesita verificar stock disponible
   *    - Puede importar ProductsModule
   *    - Usar productsService.findOne()
   * 
   * 2. CartModule (futuro):
   *    - Agregar productos al carrito
   *    - Validar existencia y stock
   *    - Importar ProductsModule
   * 
   * 3. InventoryModule (futuro):
   *    - Actualizar stock
   *    - Importar ProductsModule
   *    - Usar productsService.update()
   * 
   * NOTA:
   * A diferencia de CategoriesModule que exporta TypeOrmModule
   * (para compartir el repositorio), aquí exportamos el SERVICE.
   * 
   * ¿Por qué exportar el service y no el repositorio?
   * - El service tiene lógica de validación
   * - El service maneja relaciones correctamente
   * - Evitamos que otros módulos accedan directamente a la BD
   * - Encapsulación de lógica de negocio
   * 
   * Si exportáramos TypeOrmModule:
   * exports: [TypeOrmModule]
   * 
   * Otros módulos podrían:
   * @InjectRepository(Product)
   * private productsRepository: Repository<Product>
   * 
   * Y hacer queries directas, evitando validaciones del service.
   * 
   * Al exportar el service:
   * - Forzamos a usar la API del service
   * - Mantenemos validaciones centralizadas
   * - Mejor encapsulación
   */
  exports: [ProductsService],
})
export class ProductsModule {}

/**
 * ====================================================================
 * 📚 CONCEPTOS: RELACIONES ENTRE MÓDULOS
 * ====================================================================
 * 
 * 1. DEPENDENCIAS ENTRE MÓDULOS:
 *    
 *    ProductsModule DEPENDE de CategoriesModule
 *    
 *    ¿Por qué?
 *    - Product tiene @ManyToOne con Category
 *    - ProductsService valida que Category exista
 *    - Necesita Repository<Category>
 *    
 *    Implementación:
 *    ProductsModule:
 *      imports: [CategoriesModule]  ← Declara dependencia
 *    
 *    CategoriesModule:
 *      exports: [TypeOrmModule]     ← Comparte repositorio
 * 
 * 2. EXPORTAR SERVICE VS REPOSITORY:
 *    
 *    CategoriesModule:
 *    exports: [TypeOrmModule]  ← Repositorio directo
 *    
 *    ProductsModule:
 *    exports: [ProductsService]  ← Service con lógica
 *    
 *    ¿Cuándo exportar qué?
 *    
 *    Exportar REPOSITORIO si:
 *    - Otros módulos solo necesitan queries simples
 *    - No hay lógica compleja de validación
 *    - Quieres flexibilidad máxima
 *    
 *    Exportar SERVICE si:
 *    - Hay validaciones complejas
 *    - Quieres encapsular lógica
 *    - Mantienes control sobre cómo se usa
 * 
 * 3. CIRCULAR DEPENDENCIES (evitar):
 *    
 *    PROBLEMA:
 *    CategoriesModule imports ProductsModule
 *    ProductsModule imports CategoriesModule
 *    → ERROR: Dependencia circular
 *    
 *    SOLUCIÓN 1 (actual):
 *    Solo ProductsModule importa CategoriesModule
 *    CategoriesModule NO importa ProductsModule
 *    
 *    SOLUCIÓN 2 (forward reference):
 *    imports: [forwardRef(() => ProductsModule)]
 *    Pero es mejor evitar circulares.
 * 
 * 4. MÚLTIPLES IMPORTS:
 *    
 *    Un módulo puede importar varios:
 *    @Module({
 *      imports: [
 *        TypeOrmModule.forFeature([Product]),
 *        CategoriesModule,
 *        UsersModule,       ← Si necesita usuarios
 *        AuthModule,        ← Si necesita autenticación
 *      ]
 *    })
 * 
 * 5. SHARED MODULES:
 *    
 *    Si varios módulos necesitan CategoriesModule:
 *    
 *    AppModule:
 *    ├── CategoriesModule
 *    ├── ProductsModule → imports: [CategoriesModule]
 *    ├── OffersModule   → imports: [CategoriesModule]
 *    └── ReportsModule  → imports: [CategoriesModule]
 *    
 *    Cada uno importa CategoriesModule según necesidad.
 * 
 * 6. GLOBAL MODULES:
 *    
 *    Si un módulo debe estar disponible en TODOS:
 *    
 *    @Global()  ← Decorador adicional
 *    @Module({
 *      providers: [ConfigService],
 *      exports: [ConfigService]
 *    })
 *    export class ConfigModule {}
 *    
 *    Solo se importa en AppModule,
 *    pero está disponible en todos los módulos.
 *    
 *    Usar con cuidado (dificulta testing).
 * 
 * 7. ORGANIZACIÓN RECOMENDADA:
 *    
 *    src/
 *    ├── app.module.ts          ← Módulo raíz
 *    ├── categories/
 *    │   ├── categories.module.ts
 *    │   ├── categories.service.ts
 *    │   ├── categories.controller.ts
 *    │   ├── entities/
 *    │   └── dto/
 *    ├── products/
 *    │   ├── products.module.ts
 *    │   ├── products.service.ts
 *    │   ├── products.controller.ts
 *    │   ├── entities/
 *    │   └── dto/
 *    └── users/
 *        ├── users.module.ts
 *        └── ...
 *    
 *    Cada feature en su propia carpeta.
 *    Módulo por feature (domain-driven design).
 */