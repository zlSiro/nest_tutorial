/**
 * ====================================================================
 * CATEGORIES.MODULE.TS - MÓDULO DE CATEGORÍAS
 * ====================================================================
 * 
 * Este módulo encapsula toda la funcionalidad de categorías:
 * - Entity (Category)
 * - Service (CategoriesService)
 * - Controller (CategoriesController)
 * 
 * CARACTERÍSTICA ESPECIAL:
 * Exporta TypeOrmModule para que otros módulos (ProductsModule)
 * puedan acceder al repositorio de Category.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';

/**
 * @Module()
 * =========
 * Decorador que define un módulo de NestJS.
 * Los módulos organizan el código en componentes cohesivos.
 * 
 * PROPIEDADES:
 * - imports: Módulos que este módulo necesita
 * - controllers: Controladores de este módulo
 * - providers: Servicios (providers) de este módulo
 * - exports: Qué compartir con otros módulos
 */
@Module({
  /**
   * IMPORTS - MÓDULOS IMPORTADOS
   * ===============================
   * 
   * TypeOrmModule.forFeature([Category])
   * ====================================
   * 
   * ¿QUÉ HACE?
   * - Registra la entidad Category en TypeORM
   * - Crea el repositorio Repository<Category>
   * - Permite inyectar el repositorio con @InjectRepository(Category)
   * 
   * forFeature vs forRoot:
   * - forRoot(): En AppModule, configura la conexión a BD
   * - forFeature(): En módulos feature, registra entidades específicas
   * 
   * [Category] - Array de entidades:
   * - Pueden ser múltiples: forFeature([Category, Subcategory])
   * - Aquí solo tenemos Category
   * 
   * Esto permite en CategoriesService:
   * constructor(
   *   @InjectRepository(Category)  ← Inyectar el repositorio
   *   private categoriesRepository: Repository<Category>
   * )
   */
  imports: [TypeOrmModule.forFeature([Category])],

  /**
   * CONTROLLERS - CONTROLADORES DEL MÓDULO
   * ========================================
   * 
   * [CategoriesController]
   * - Define los endpoints HTTP: GET, POST, PATCH, DELETE /categories
   * - NestJS instancia automáticamente el controlador
   * - Inyecta CategoriesService en el constructor
   * 
   * Endpoints disponibles:
   * - POST   /categories
   * - GET    /categories
   * - GET    /categories/:id
   * - PATCH  /categories/:id
   * - DELETE /categories/:id
   */
  controllers: [CategoriesController],

  /**
   * PROVIDERS - SERVICIOS DEL MÓDULO
   * ==================================
   * 
   * [CategoriesService]
   * - Contiene la lógica de negocio
   * - Interactúa con el repositorio de Category
   * - Es inyectable (tiene @Injectable())
   * - NestJS crea una única instancia (Singleton)
   * 
   * ¿QUÉ ES UN PROVIDER?
   * - Cualquier clase con @Injectable()
   * - Puede ser inyectada en constructores
   * - Gestionada por el sistema de DI de NestJS
   * 
   * Ejemplos de providers:
   * - Services
   * - Repositories (creados por TypeORM)
   * - Factories
   * - Helpers
   */
  providers: [CategoriesService],

  /**
   * EXPORTS - QUÉ COMPARTIR CON OTROS MÓDULOS
   * ============================================
   * 
   * [TypeOrmModule]
   * ===============
   * 
   * ¿POR QUÉ EXPORTAR TypeOrmModule?
   * - ProductsModule necesita el repositorio de Category
   * - ProductsService valida que las categorías existan
   * - Para inyectar @InjectRepository(Category) en ProductsService
   * 
   * Sin este export:
   * ProductsService → @InjectRepository(Category) → ERROR
   * "CategoryRepository not found"
   * 
   * Con este export:
   * CategoriesModule exporta TypeOrmModule
   * ProductsModule importa CategoriesModule
   * ProductsService puede inyectar Repository<Category>
   * 
   * FLUJO:
   * 1. CategoriesModule:
   *    imports: [TypeOrmModule.forFeature([Category])]
   *    exports: [TypeOrmModule]  ← Comparte el repositorio
   * 
   * 2. ProductsModule:
   *    imports: [CategoriesModule]  ← Recibe el repositorio exportado
   * 
   * 3. ProductsService:
   *    @InjectRepository(Category)  ← Puede inyectar porque CategoriesModule lo exportó
   *    private categoriesRepository: Repository<Category>
   * 
   * ALTERNATIVAS:
   * 
   * Opción 1 (actual):
   * exports: [TypeOrmModule]
   * - Exporta el repositorio de Category
   * - Otros módulos pueden inyectarlo
   * 
   * Opción 2:
   * exports: [CategoriesService]
   * - Exporta el servicio completo
   * - ProductsService usaría categoriesService.findOne()
   * - Más acoplamiento entre módulos
   * 
   * Opción 3 (no recomendada):
   * ProductsModule:
   * imports: [TypeOrmModule.forFeature([Category])]
   * - Duplica el registro de Category
   * - Puede causar inconsistencias
   * 
   * La Opción 1 es la más limpia y recomendada.
   */
  exports: [TypeOrmModule], // Exportar para que otros módulos puedan usar Category
})
export class CategoriesModule {}

/**
 * ====================================================================
 * 📚 CONCEPTOS: MÓDULOS Y ARQUITECTURA
 * ====================================================================
 * 
 * 1. ¿QUÉ ES UN MÓDULO?
 *    
 *    Un módulo es un contenedor que agrupa:
 *    - Controladores (HTTP endpoints)
 *    - Servicios (lógica de negocio)
 *    - Entidades (modelos de BD)
 *    - Otros módulos relacionados
 *    
 *    Organización:
 *    categories/
 *    ├── categories.module.ts    ← Configuración del módulo
 *    ├── categories.controller.ts ← Endpoints HTTP
 *    ├── categories.service.ts    ← Lógica de negocio
 *    ├── entities/
 *    │   └── category.entity.ts   ← Modelo de BD
 *    └── dto/
 *        ├── create-category.dto.ts
 *        └── update-category.dto.ts
 * 
 * 2. INYECCIÓN DE DEPENDENCIAS (DI):
 *    
 *    Sin DI (acoplamiento fuerte):
 *    class CategoriesController {
 *      constructor() {
 *        this.service = new CategoriesService();  ✗ Malo
 *      }
 *    }
 *    
 *    Con DI (acoplamiento débil):
 *    class CategoriesController {
 *      constructor(
 *        private readonly service: CategoriesService  ✓ Bueno
 *      ) {}
 *    }
 *    
 *    Ventajas:
 *    - Testing más fácil (mock services)
 *    - Singleton automático (una instancia compartida)
 *    - Menos acoplamiento
 * 
 * 3. IMPORTS VS EXPORTS:
 *    
 *    imports:
 *    - "Qué necesito YO para funcionar"
 *    - Trae funcionalidad de otros módulos
 *    - Uso interno del módulo
 *    
 *    exports:
 *    - "Qué comparto CON OTROS"
 *    - Expone funcionalidad a otros módulos
 *    - Debe estar en imports o providers
 *    
 *    Ejemplo:
 *    @Module({
 *      imports: [TypeOrmModule.forFeature([Category])],  ← Necesito esto
 *      providers: [CategoriesService],                   ← Creo esto
 *      exports: [TypeOrmModule]                          ← Comparto esto
 *    })
 * 
 * 4. forFeature VS forRoot:
 *    
 *    forRoot() - En AppModule (una vez):
 *    TypeOrmModule.forRoot({
 *      type: 'mysql',
 *      host: 'localhost',
 *      port: 3306,
 *      database: 'mydb',
 *      synchronize: true,
 *      autoLoadEntities: true  ← Importante
 *    })
 *    
 *    forFeature() - En cada Feature Module:
 *    TypeOrmModule.forFeature([Category])
 *    
 *    autoLoadEntities: true hace que TypeORM
 *    descubra automáticamente las entidades
 *    registradas con forFeature().
 * 
 * 5. COMPARTIR REPOSITORIOS:
 *    
 *    Problema:
 *    ProductsModule necesita validar que Category existe.
 *    
 *    Solución 1 (actual):
 *    CategoriesModule exports: [TypeOrmModule]
 *    ProductsModule imports: [CategoriesModule]
 *    ProductsService @InjectRepository(Category)
 *    
 *    Solución 2 (servicio compartido):
 *    CategoriesModule exports: [CategoriesService]
 *    ProductsModule imports: [CategoriesModule]
 *    ProductsService usa categoriesService.findOne()
 *    
 *    ¿Cuál elegir?
 *    - Solución 1: Menos acoplamiento, más flexible
 *    - Solución 2: Más acoplamiento, reutiliza lógica
 * 
 * 6. CICLO DE VIDA:
 *    
 *    1. NestJS lee @Module()
 *    2. Registra imports (TypeOrmModule, etc.)
 *    3. Instancia providers (CategoriesService)
 *    4. Inyecta dependencias en constructores
 *    5. Instancia controllers (CategoriesController)
 *    6. Registra rutas HTTP
 *    7. Aplicación lista
 * 
 * 7. PATRONES COMUNES:
 *    
 *    Feature Module (como CategoriesModule):
 *    - Un módulo por feature/dominio
 *    - Encapsula entities, services, controllers
 *    - Puede exportar funcionalidad
 *    
 *    Shared Module:
 *    - Funcionalidad común (auth, logging, etc.)
 *    - @Global() para estar disponible en todos lados
 *    
 *    Core Module:
 *    - Servicios singleton globales
 *    - Guards, interceptors, pipes
 *    - Solo importado en AppModule
 */