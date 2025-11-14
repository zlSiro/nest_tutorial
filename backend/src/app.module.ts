/**
 * ====================================================================
 * APP.MODULE.TS - MÓDULO RAÍZ DE LA APLICACIÓN
 * ====================================================================
 * 
 * Este es el módulo principal que orquesta toda la aplicación.
 * En NestJS, los módulos son como "contenedores" que agrupan
 * funcionalidades relacionadas (controladores, servicios, etc.)
 * 
 * ARQUITECTURA DE MÓDULOS:
 * - AppModule: Módulo raíz que importa todos los demás módulos
 * - ConfigModule: Maneja variables de entorno (.env)
 * - TypeOrmModule: Conecta la aplicación con la base de datos
 * - UsersModule: Módulo de funcionalidad de usuarios
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

/**
 * Decorador @Module - Define un módulo de NestJS
 * 
 * Un módulo puede tener:
 * - imports: Otros módulos que este módulo necesita
 * - controllers: Controladores que manejan las rutas HTTP
 * - providers: Servicios y clases inyectables
 * - exports: Qué exporta este módulo para que otros lo usen
 */
@Module({
  imports: [
    // 1️⃣ CONFIGURACIÓN DE VARIABLES DE ENTORNO
    // ConfigModule.forRoot() carga las variables del archivo .env
    ConfigModule.forRoot({
      // isGlobal: true → Hace que las variables estén disponibles
      // en TODOS los módulos sin necesidad de importar ConfigModule
      isGlobal: true,
    }),

    // 2️⃣ CONFIGURACIÓN DE LA BASE DE DATOS
    // TypeOrmModule.forRoot() establece la conexión con MySQL
    TypeOrmModule.forRoot({
      // Tipo de base de datos (mysql, postgres, sqlite, etc.)
      type: 'mysql',
      
      // Credenciales de conexión (vienen del archivo .env)
      host: process.env.DB_HOST,           // Ej: 'localhost'
      port: parseInt(process.env.DB_PORT || '3306'), // Puerto de MySQL
      username: process.env.DB_USERNAME,   // Usuario de la BD
      password: process.env.DB_PASSWORD,   // Contraseña de la BD
      database: process.env.DB_NAME,       // Nombre de la base de datos
      
      // entities: Array de entidades (modelos de tablas)
      // __dirname + '/**/*.entity{.ts,.js}' busca todos los archivos
      // que terminen en .entity.ts o .entity.js en cualquier carpeta
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      
      // ⚠️ CONFIGURACIONES PELIGROSAS - SOLO PARA DESARROLLO ⚠️
      
      // dropSchema: Elimina y recrea todas las tablas cada vez que inicias
      // ❌ NUNCA usar en producción (perderías todos los datos)
      dropSchema: false,
      
      // synchronize: Sincroniza automáticamente el esquema de BD con las entidades
      // Si cambias una entidad, TypeORM actualiza la tabla automáticamente
      // ❌ NUNCA usar en producción (usa migraciones en su lugar)
      synchronize: false,
    }),

    // 3️⃣ MÓDULOS DE FUNCIONALIDAD
    // Aquí importamos todos los módulos de features de nuestra app
    UsersModule, // Módulo que maneja toda la lógica de usuarios
  ],
})
export class AppModule {}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. ¿Por qué usar módulos?
 *    - Organización: Cada funcionalidad está en su propio módulo
 *    - Reutilización: Los módulos se pueden importar donde se necesiten
 *    - Escalabilidad: Fácil agregar nuevos módulos sin afectar otros
 * 
 * 2. Orden de inicialización:
 *    - ConfigModule se carga primero (variables de entorno)
 *    - TypeOrmModule se conecta a la BD
 *    - UsersModule y otros módulos se inicializan
 * 
 * 3. En producción:
 *    - Cambiar dropSchema y synchronize a false
 *    - Usar migraciones para cambios en la BD
 *    - Considerar usar variables de entorno más seguras
 */
