/**
 * ====================================================================
 * MAIN.TS - PUNTO DE ENTRADA DE LA APLICACIÓN
 * ====================================================================
 * 
 * Este archivo es el corazón de nuestra aplicación NestJS.
 * Aquí se inicializa el servidor y se configuran los pipes globales.
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Se importan las dependencias necesarias
 * 2. Se define la función bootstrap() que arranca la aplicación
 * 3. Se crea la instancia de la aplicación con NestFactory
 * 4. Se configuran middlewares y pipes globales
 * 5. El servidor comienza a escuchar en el puerto especificado
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Función bootstrap - Inicializa y configura la aplicación
 * 
 * Es una función asíncrona porque muchas operaciones de NestJS
 * son promesas (conexión a BD, inicio del servidor, etc.)
 */
async function bootstrap() {
  // 1️⃣ CREACIÓN DE LA APLICACIÓN
  // NestFactory.create() crea una instancia de nuestra aplicación
  // usando el AppModule como módulo raíz
  const app = await NestFactory.create(AppModule);

  // 2️⃣ CONFIGURACIÓN DE VALIDACIÓN GLOBAL
  // ValidationPipe valida automáticamente todos los DTOs que entran
  // a nuestros endpoints. Es como un "guardia de seguridad" que
  // verifica que los datos cumplan con las reglas definidas
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: Elimina propiedades que NO están definidas en el DTO
      // Ejemplo: Si envías {email, password, hack: true}, elimina 'hack'
      whitelist: true,
      
      // forbidNonWhitelisted: Si hay propiedades extra, lanza un error
      // En lugar de ignorarlas, le dice al cliente "estos campos no existen"
      forbidNonWhitelisted: true,
      
      // transform: Convierte los tipos automáticamente
      // Ejemplo: "123" (string) → 123 (number) si el DTO espera un número
      transform: true,
    }),
  );

  // 3️⃣ CONFIGURACIÓN DEL PUERTO
  // Usa la variable de entorno PORT, o 3000 por defecto
  // El operador ?? es "nullish coalescing": usa 3000 solo si PORT es null/undefined
  const port = process.env.PORT ?? 3000;

  // 4️⃣ INICIO DEL SERVIDOR
  // El servidor comienza a escuchar peticiones HTTP en el puerto especificado
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}

// Ejecutamos la función bootstrap para iniciar la aplicación
bootstrap();
