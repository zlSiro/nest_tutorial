/**
 * ====================================================================
 * USERS.MODULE.TS - MÓDULO DE FUNCIONALIDAD DE USUARIOS
 * ====================================================================
 * 
 * Este módulo encapsula TODA la funcionalidad relacionada con usuarios:
 * - Rutas/Endpoints (Controller)
 * - Lógica de negocio (Service)
 * - Modelo de datos (Entity)
 * - Validaciones (DTOs)
 * 
 * PATRÓN: Cada feature de la aplicación tiene su propio módulo
 * Ejemplo: UsersModule, AuthModule, ProductsModule, etc.
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * Decorador @Module - Configura el módulo de usuarios
 */
@Module({
  // 1️⃣ IMPORTS - Módulos que este módulo necesita
  imports: [
    // TypeOrmModule.forFeature() registra las entidades para este módulo
    // Le dice a TypeORM: "Este módulo trabajará con la entidad User"
    // Esto permite inyectar el Repository<User> en el UsersService
    TypeOrmModule.forFeature([User]),
    
    // Si necesitáramos otros módulos, los importaríamos aquí
    // Ejemplo: imports: [TypeOrmModule.forFeature([User]), AuthModule]
  ],

  // 2️⃣ CONTROLLERS - Controladores que manejan las rutas HTTP
  controllers: [
    UsersController, // Maneja las rutas: GET /users, POST /users, etc.
  ],

  // 3️⃣ PROVIDERS - Servicios y clases inyectables
  providers: [
    UsersService, // Contiene la lógica de negocio de usuarios
  ],

  // 4️⃣ EXPORTS - Qué exporta este módulo para que otros lo usen
  exports: [
    UsersService, // Exportamos el servicio para que otros módulos lo puedan usar
    // Por ejemplo, un AuthModule podría importar UsersModule para
    // usar UsersService y buscar usuarios al hacer login
  ],
})
export class UsersModule {}

/**
 * ARQUITECTURA DEL MÓDULO:
 * 
 * ┌─────────────────────────────────────┐
 * │         USERS MODULE                │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │  ┌──────────────────────────────┐  │
 * │  │   UsersController            │  │ ← Maneja HTTP Requests
 * │  │   (Rutas/Endpoints)          │  │
 * │  └────────────┬─────────────────┘  │
 * │               │                     │
 * │               ▼                     │
 * │  ┌──────────────────────────────┐  │
 * │  │   UsersService               │  │ ← Lógica de Negocio
 * │  │   (Business Logic)           │  │
 * │  └────────────┬─────────────────┘  │
 * │               │                     │
 * │               ▼                     │
 * │  ┌──────────────────────────────┐  │
 * │  │   Repository<User>           │  │ ← Acceso a Base de Datos
 * │  │   (Database Access)          │  │
 * │  └──────────────────────────────┘  │
 * │                                     │
 * └─────────────────────────────────────┘
 * 
 * FLUJO DE UNA REQUEST:
 * 1. Cliente hace POST /users con datos
 * 2. UsersController recibe la request
 * 3. Controller llama a UsersService.create()
 * 4. Service usa Repository para guardar en BD
 * 5. Service devuelve el usuario creado
 * 6. Controller envía la respuesta al cliente
 */
