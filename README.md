# 📘 Tutorial NestJS - API REST de Usuarios

> **Guía Pedagógica Completa**: De Cero a API Funcional

Este proyecto es una API REST completa para gestión de usuarios, construida con NestJS, TypeORM y MySQL. Está diseñada como material educativo para estudiantes de ingeniería informática que quieren aprender desarrollo backend moderno.

---

## 📑 Tabla de Contenidos

1. [¿Qué construiremos?](#-qué-construiremos)
2. [Requisitos Previos](#-requisitos-previos)
3. [Conceptos Fundamentales](#-conceptos-fundamentales)
4. [Paso a Paso - Construcción del Proyecto](#-paso-a-paso---construcción-del-proyecto)
5. [Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
6. [Testing de la API](#-testing-de-la-api)
7. [Errores Comunes y Soluciones](#-errores-comunes-y-soluciones)
8. [Mejoras Futuras](#-mejoras-futuras)
9. [Recursos Adicionales](#-recursos-adicionales)

---

## 🎯 ¿Qué construiremos?

Una API REST completa con las siguientes características:

### ✅ Funcionalidades
- ✨ **CRUD Completo de Usuarios** (Create, Read, Update, Delete)
- 🔐 **Seguridad**: Contraseñas hasheadas con bcrypt
- ✔️ **Validaciones**: Datos validados con class-validator
- 🗄️ **Base de Datos**: MySQL con TypeORM
- 🧹 **Soft Delete**: Eliminación lógica de usuarios
- 📝 **Timestamps**: Registro automático de fechas
- ⚡ **Manejo de Errores**: Respuestas HTTP apropiadas

### 🛠️ Tecnologías Utilizadas
- **NestJS** 11.x - Framework backend progresivo
- **TypeORM** 0.3.x - ORM para TypeScript
- **MySQL** 8.x - Base de datos relacional
- **TypeScript** 5.x - JavaScript con tipos
- **class-validator** - Validación de DTOs
- **bcrypt** - Hashing de contraseñas

---

## 📋 Requisitos Previos

### 🧰 Conocimientos Necesarios
- ✅ JavaScript/TypeScript básico
- ✅ Conceptos de HTTP (GET, POST, PATCH, DELETE)
- ✅ JSON y APIs REST
- ✅ Bases de datos relacionales (SQL básico)
- ✅ Terminal/Línea de comandos
- ⭐ Opcional: Patrones de diseño (ayuda pero no es imprescindible)

### 💻 Software Requerido
```bash
# Node.js 18.x o superior
node --version  # v18.0.0+

# npm 9.x o superior
npm --version   # 9.0.0+

# MySQL 8.x
mysql --version # 8.0+
```

### 📦 Instalación de Prerequisitos

**Windows:**
```bash
# Instalar Node.js desde: https://nodejs.org/
# Instalar MySQL desde: https://dev.mysql.com/downloads/mysql/
```

**macOS:**
```bash
brew install node
brew install mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm mysql-server
```

---

## 🧠 Conceptos Fundamentales

Antes de empezar, es importante entender estos conceptos:

### 🏗️ Arquitectura MVC/MSC
```
┌─────────────────────────────────────────────┐
│           CLIENTE (Frontend/Postman)        │
└────────────────┬────────────────────────────┘
                 │ HTTP Request
                 ↓
┌─────────────────────────────────────────────┐
│  CONTROLLER (Maneja rutas HTTP)             │
│  - Recibe requests                          │
│  - Valida parámetros                        │
│  - Llama al Service                         │
│  - Devuelve responses                       │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  SERVICE (Lógica de negocio)                │
│  - Valida reglas de negocio                 │
│  - Coordina operaciones                     │
│  - Usa Repository para BD                  │
│  - Transforma datos                         │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  REPOSITORY (Acceso a datos)                │
│  - Queries a la base de datos               │
│  - CRUD operations                          │
│  - Mapeo ORM                                │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  BASE DE DATOS (MySQL)                      │
│  - Tabla users                              │
│  - Datos persistentes                       │
└─────────────────────────────────────────────┘
```

### 🎯 Inyección de Dependencias
En lugar de crear manualmente las instancias:
```typescript
// ❌ Sin inyección (acoplado, difícil de testear)
class UsersController {
  private usersService = new UsersService();
}

// ✅ Con inyección (desacoplado, fácil de testear)
class UsersController {
  constructor(private usersService: UsersService) {}
}
```
NestJS crea y gestiona las instancias automáticamente.

### 📦 Módulos en NestJS
Los módulos son "contenedores" que agrupan funcionalidad relacionada:
```typescript
@Module({
  imports: [...],      // Otros módulos que necesito
  controllers: [...],  // Controladores (endpoints)
  providers: [...],    // Servicios y clases inyectables
  exports: [...]       // Qué exporto para otros módulos
})
```

### 🔄 DTOs (Data Transfer Objects)
Definen la estructura de datos y las validaciones:
```typescript
class CreateUserDto {
  @IsEmail()
  email: string;  // Solo acepta emails válidos
  
  @MinLength(6)
  password: string;  // Mínimo 6 caracteres
}
```

---

## 🚀 Paso a Paso - Construcción del Proyecto

### 📝 Índice de Pasos
1. [Configuración Inicial del Proyecto](#paso-1-configuración-inicial-del-proyecto)
2. [Configuración de la Base de Datos](#paso-2-configuración-de-la-base-de-datos)
3. [Creación del Módulo de Usuarios](#paso-3-creación-del-módulo-de-usuarios)
4. [Creación de la Entidad (Modelo de BD)](#paso-4-creación-de-la-entidad-modelo-de-bd)
5. [Creación de los DTOs](#paso-5-creación-de-los-dtos)
6. [Implementación del Service](#paso-6-implementación-del-service)
7. [Implementación del Controller](#paso-7-implementación-del-controller)
8. [Configuración de Validaciones Globales](#paso-8-configuración-de-validaciones-globales)
9. [Testing de la API](#paso-9-testing-de-la-api)

---

### 📍 PASO 1: Configuración Inicial del Proyecto

#### 1.1 Instalar NestJS CLI
```bash
# Instalar globalmente el CLI de NestJS
npm install -g @nestjs/cli

# Verificar instalación
nest --version
```

#### 1.2 Crear un Nuevo Proyecto
```bash
# Crear proyecto con npm
nest new backend

# Entrar al directorio
cd backend

# Abrir en VS Code
code .
```

**¿Qué hace esto?**
- Crea la estructura base del proyecto
- Instala todas las dependencias
- Configura TypeScript
- Crea archivos de configuración (tsconfig.json, nest-cli.json)

#### 1.3 Estructura Inicial Generada
```
backend/
├── src/
│   ├── app.controller.ts      # Controlador de ejemplo
│   ├── app.module.ts           # Módulo raíz
│   ├── app.service.ts          # Servicio de ejemplo
│   └── main.ts                 # Punto de entrada
├── test/                       # Tests E2E
├── package.json                # Dependencias
├── tsconfig.json               # Config TypeScript
└── nest-cli.json               # Config NestJS
```

#### 1.4 Instalar Dependencias Adicionales
```bash
# TypeORM y MySQL
npm install @nestjs/typeorm typeorm mysql2

# Variables de entorno
npm install @nestjs/config

# Validaciones
npm install class-validator class-transformer

# Bcrypt para contraseñas
npm install bcrypt
npm install -D @types/bcrypt

# Mapped types (para UpdateUserDto)
npm install @nestjs/mapped-types
```

**Explicación de cada paquete:**
- `@nestjs/typeorm` + `typeorm`: ORM para interactuar con BD
- `mysql2`: Driver de MySQL para Node.js
- `@nestjs/config`: Manejo de variables de entorno (.env)
- `class-validator` + `class-transformer`: Validación de DTOs
- `bcrypt`: Librería para hashear contraseñas de forma segura
- `@nestjs/mapped-types`: Utilidades para transformar DTOs

---

### 📍 PASO 2: Configuración de la Base de Datos

#### 2.1 Crear la Base de Datos
```sql
-- Conectarse a MySQL
mysql -u root -p

-- Crear la base de datos
CREATE DATABASE nest_users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario (opcional, mejor práctica)
CREATE USER 'nest_user'@'localhost' IDENTIFIED BY 'nest_password';
GRANT ALL PRIVILEGES ON nest_users_db.* TO 'nest_user'@'localhost';
FLUSH PRIVILEGES;

-- Salir
exit;
```

#### 2.2 Crear Archivo de Variables de Entorno
Crea `.env` en la raíz del proyecto:
```env
# .env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nest_user
DB_PASSWORD=nest_password
DB_NAME=nest_users_db
```

**⚠️ IMPORTANTE:** Agregar `.env` al `.gitignore`:
```bash
echo ".env" >> .gitignore
```

#### 2.3 Configurar TypeORM en AppModule
Edita `src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,  // Disponible en todos los módulos
    }),
    
    // Configuración de TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,   // ⚠️ Solo en desarrollo
      dropSchema: true,    // ⚠️ Solo para testing (borra datos)
    }),
  ],
})
export class AppModule {}
```

**⚠️ Advertencias de Producción:**
- `synchronize: true` → Cambia a `false` en producción
- `dropSchema: true` → Elimínalo en producción (borra toda la BD)
- En producción usa **migraciones** en lugar de sincronización automática

---

### 📍 PASO 3: Creación del Módulo de Usuarios

#### 3.1 Generar el Módulo con CLI
```bash
# Genera module, service y controller automáticamente
nest generate resource users

# Opciones que aparecerán:
# ? What transport layer do you use? → REST API
# ? Would you like to generate CRUD entry points? → Yes
```

**¿Qué genera esto?**
```
src/users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
├── users.module.ts
└── users.service.ts
```

#### 3.2 Estructura del Módulo
```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Registra la entidad
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Para usar en otros módulos
})
export class UsersModule {}
```

#### 3.3 Importar UsersModule en AppModule
```typescript
// src/app.module.ts
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(...),
    TypeOrmModule.forRoot(...),
    UsersModule,  // ← Agregar aquí
  ],
})
export class AppModule {}
```

---

### 📍 PASO 4: Creación de la Entidad (Modelo de BD)

#### 4.1 Definir la Entity
Edita `src/users/entities/user.entity.ts`:
```typescript
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('users')  // Nombre de la tabla
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column()
  apellido: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
```

**Mapeo TypeScript ↔ MySQL:**
| TypeScript | Decorador | MySQL |
|------------|-----------|-------|
| `id: number` | `@PrimaryGeneratedColumn()` | `INT AUTO_INCREMENT PRIMARY KEY` |
| `email: string` | `@Column({ unique: true })` | `VARCHAR(255) UNIQUE` |
| `password: string` | `@Column()` | `VARCHAR(255)` |
| `isActive: boolean` | `@Column({ default: true })` | `TINYINT(1) DEFAULT 1` |
| `createdAt: Date` | `@CreateDateColumn()` | `TIMESTAMP DEFAULT NOW()` |

---

### 📍 PASO 5: Creación de los DTOs

#### 5.1 CreateUserDto - Para Crear Usuarios
Edita `src/users/dto/create-user.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;
}
```

#### 5.2 UpdateUserDto - Para Actualizar Usuarios
Edita `src/users/dto/update-user.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Hace todos los campos de CreateUserDto opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

**¿Por qué PartialType?**
- PATCH permite actualizar solo algunos campos
- No queremos repetir todo el código de CreateUserDto
- PartialType hace todos los campos opcionales automáticamente
- Mantiene las mismas validaciones

---

### 📍 PASO 6: Implementación del Service

Edita `src/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // CREATE - Crear usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Verificar email único
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3. Crear usuario
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 4. Guardar en BD
    return this.usersRepository.save(newUser);
  }

  // READ ALL - Listar usuarios activos
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { isActive: true },
      select: ['id', 'nombre', 'apellido', 'email', 'createdAt', 'updatedAt']
    });
  }

  // READ ONE - Buscar usuario por ID
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  // UPDATE - Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Validar email único si se actualiza
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    // Hashear nueva contraseña si se actualiza
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  // DELETE - Soft delete (eliminar lógicamente)
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
  }
}
```

---

### 📍 PASO 7: Implementación del Controller

Edita `src/users/users.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // PATCH /users/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

---

### 📍 PASO 8: Configuración de Validaciones Globales

Edita `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true,   // Lanza error si hay propiedades extra
      transform: true,              // Transforma tipos automáticamente
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
bootstrap();
```

---

### 📍 PASO 9: Testing de la API

#### 9.1 Iniciar el Servidor
```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Deberías ver:
# 🚀 Servidor corriendo en http://localhost:3000
```

#### 9.2 Testing con cURL o Postman

**1️⃣ Crear Usuario (POST /users)**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

**Respuesta esperada (201 Created):**
```json
{
  "id": 1,
  "email": "juan@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "isActive": true,
  "createdAt": "2025-11-14T10:30:00.000Z",
  "updatedAt": "2025-11-14T10:30:00.000Z"
}
```

**2️⃣ Listar Usuarios (GET /users)**
```bash
curl http://localhost:3000/users
```

**3️⃣ Buscar Usuario por ID (GET /users/:id)**
```bash
curl http://localhost:3000/users/1
```

**4️⃣ Actualizar Usuario (PATCH /users/:id)**
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos"
  }'
```

**5️⃣ Eliminar Usuario (DELETE /users/:id)**
```bash
curl -X DELETE http://localhost:3000/users/1
```

**Respuesta esperada (204 No Content):**
Sin contenido (exitoso)

---

## 🏛️ Arquitectura del Proyecto

### 📁 Estructura Final del Proyecto
```
backend/
├── src/
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts       # Validaciones para crear
│   │   │   └── update-user.dto.ts       # Validaciones para actualizar
│   │   ├── entities/
│   │   │   └── user.entity.ts           # Modelo de BD (tabla users)
│   │   ├── users.controller.ts          # Rutas HTTP (endpoints)
│   │   ├── users.service.ts             # Lógica de negocio
│   │   └── users.module.ts              # Configuración del módulo
│   ├── app.module.ts                    # Módulo raíz
│   └── main.ts                          # Punto de entrada
├── .env                                 # Variables de entorno
├── package.json                         # Dependencias
└── tsconfig.json                        # Config TypeScript
```

### 🔄 Flujo de una Request HTTP

```
1. Cliente hace request:
   POST http://localhost:3000/users
   Body: { "email": "...", "password": "...", "nombre": "...", "apellido": "..." }
   
   ↓

2. NestJS recibe la request en main.ts
   - ValidationPipe valida el body contra CreateUserDto
   - Si inválido → 400 Bad Request con errores
   - Si válido → Continúa
   
   ↓

3. Router dirige a UsersController.create()
   - @Post() decorator identifica el método
   - @Body() extrae y parsea el JSON
   
   ↓

4. Controller llama a UsersService.create()
   - Delega la lógica de negocio al servicio
   
   ↓

5. Service procesa la lógica:
   - Verifica email único (query a BD)
   - Hashea la contraseña con bcrypt
   - Crea usuario con Repository.create()
   - Guarda en BD con Repository.save()
   
   ↓

6. Service devuelve el usuario al Controller
   
   ↓

7. Controller devuelve respuesta HTTP:
   - Status: 201 Created
   - Body: Usuario creado (con ID, timestamps, etc.)
   
   ↓

8. Cliente recibe la respuesta
```

### 🎨 Patrones de Diseño Utilizados

#### 1. **Module Pattern**
Organiza código en módulos cohesivos y reutilizables.

#### 2. **Dependency Injection (DI)**
Las dependencias se inyectan automáticamente, no se crean manualmente.

#### 3. **Repository Pattern**
Abstrae el acceso a datos detrás de una interfaz limpia.

#### 4. **DTO Pattern**
Objetos que definen cómo se transfieren datos entre capas.

#### 5. **Singleton Pattern**
Los servicios son singleton por defecto (una sola instancia).

---

## 🧪 Testing de la API

### Colección de Postman

Crea una colección con estos endpoints:

#### 1. Crear Usuario
```
POST http://localhost:3000/users
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "nombre": "Test",
  "apellido": "User"
}
```

#### 2. Listar Usuarios
```
GET http://localhost:3000/users
```

#### 3. Buscar Usuario
```
GET http://localhost:3000/users/1
```

#### 4. Actualizar Usuario
```
PATCH http://localhost:3000/users/1
Content-Type: application/json

{
  "nombre": "Updated Name"
}
```

#### 5. Eliminar Usuario
```
DELETE http://localhost:3000/users/1
```

### Testing de Validaciones

**❌ Email inválido:**
```json
{
  "email": "not-an-email",
  "password": "password123",
  "nombre": "Test",
  "apellido": "User"
}
```
Respuesta: `400 Bad Request - "email must be an email"`

**❌ Contraseña corta:**
```json
{
  "email": "test@example.com",
  "password": "12345",
  "nombre": "Test",
  "apellido": "User"
}
```
Respuesta: `400 Bad Request - "password must be longer than or equal to 6 characters"`

**❌ Email duplicado:**
```json
{
  "email": "juan@example.com",  // Ya existe
  "password": "password123",
  "nombre": "Test",
  "apellido": "User"
}
```
Respuesta: `409 Conflict - "El correo ya está registrado"`

---

## 🐛 Errores Comunes y Soluciones

### 1. Error de Conexión a MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución:**
- Verifica que MySQL esté corriendo: `sudo systemctl status mysql`
- Revisa las credenciales en `.env`
- Verifica el puerto (por defecto 3306)

### 2. Tabla no existe
```
Error: ER_NO_SUCH_TABLE: Table 'nest_users_db.users' doesn't exist
```
**Solución:**
- Verifica `synchronize: true` en `app.module.ts`
- Reinicia el servidor: `npm run start:dev`
- O crea la tabla manualmente con el SQL de la entity

### 3. Validación no funciona
```
El email inválido se acepta
```
**Solución:**
- Verifica que `ValidationPipe` esté configurado en `main.ts`
- Verifica que los decoradores (`@IsEmail()`, etc.) estén en el DTO
- Reinicia el servidor

### 4. Password en texto plano en la respuesta
```
{
  "id": 1,
  "password": "$2b$10$...",  // No debería aparecer
  ...
}
```
**Solución:**
- Agrega `select: false` en la entity:
  ```typescript
  @Column({ type: 'varchar', select: false })
  password: string;
  ```
- O usa `select` en las queries del service

### 5. Puerto en uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución:**
- Cambia el puerto en `.env`: `PORT=3001`
- O mata el proceso: `lsof -ti:3000 | xargs kill`

---

## 🚀 Mejoras Futuras

### Nivel Básico
- [ ] Agregar paginación en `findAll()`
- [ ] Implementar filtros de búsqueda
- [ ] Agregar más validaciones a los DTOs
- [ ] Implementar recuperación de contraseña

### Nivel Intermedio
- [ ] Autenticación con JWT
- [ ] Roles y permisos (Admin, User)
- [ ] Subida de avatar de usuario
- [ ] Rate limiting
- [ ] Logging con Winston

### Nivel Avanzado
- [ ] Migraciones de base de datos (TypeORM migrations)
- [ ] Tests unitarios y E2E con Jest
- [ ] Documentación con Swagger
- [ ] Caché con Redis
- [ ] Implementar GraphQL

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator](https://github.com/typestack/class-validator)

### Tutoriales Recomendados
- [NestJS Crash Course - Traversy Media](https://www.youtube.com/watch?v=2n3xS89TJMI)
- [TypeORM Tutorial](https://www.youtube.com/watch?v=JaTbzPcyiOE)

### Comunidades
- [NestJS Discord](https://discord.gg/nestjs)
- [Stack Overflow - NestJS Tag](https://stackoverflow.com/questions/tagged/nestjs)

---

## 🎓 Ejercicios Propuestos

### Ejercicio 1: Agregar Campo "Edad"
1. Agrega un campo `edad: number` a la entity
2. Agrega validaciones en el DTO (`@IsNumber()`, `@Min(18)`, `@Max(120)`)
3. Actualiza el service y controller si es necesario
4. Prueba con Postman

### Ejercicio 2: Implementar Búsqueda por Email
1. Crea un endpoint `GET /users/search?email=xxx`
2. Implementa el método en el service
3. Usa `@Query()` en el controller
4. Prueba la funcionalidad

### Ejercicio 3: Agregar Paginación
1. Crea un endpoint `GET /users?page=1&limit=10`
2. Usa `take` y `skip` en TypeORM
3. Devuelve también el total de registros
4. Implementa metadatos de paginación en la respuesta

---

## 💡 Consejos Finales

### Para Estudiantes
- ✅ No copies y pegues todo de una vez, implementa paso a paso
- ✅ Lee los comentarios en el código, explican conceptos importantes
- ✅ Experimenta modificando valores y observa qué pasa
- ✅ Si algo no funciona, lee el error completo (suele indicar el problema)
- ✅ Usa console.log() para debuggear y entender el flujo

### Buenas Prácticas
- ✅ Nunca commitees el `.env` al repositorio
- ✅ Usa nombres descriptivos para variables y métodos
- ✅ Mantén las funciones pequeñas y con una sola responsabilidad
- ✅ Valida siempre los datos de entrada
- ✅ Maneja los errores apropiadamente

### Seguridad
- ✅ Siempre hashea las contraseñas
- ✅ No expongas información sensible en las respuestas
- ✅ Valida y sanitiza todos los inputs
- ✅ Usa variables de entorno para credenciales
- ✅ No uses `synchronize: true` en producción

---

## 📝 Licencia

Este proyecto es material educativo de libre uso para estudiantes.

---

## 👨‍💻 Autor

Tutorial creado con fines pedagógicos para estudiantes de Ingeniería Informática.

**¿Preguntas? ¿Mejoras?** 
Abre un issue o contribuye con un pull request.

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y tu API funciona, ¡felicidades! 🎊

Has aprendido:
- ✅ Arquitectura de NestJS (Módulos, Controllers, Services)
- ✅ TypeORM y bases de datos relacionales
- ✅ DTOs y validaciones
- ✅ CRUD completo
- ✅ Seguridad básica (bcrypt)
- ✅ Manejo de errores HTTP
- ✅ Soft delete y timestamps

**Próximos pasos sugeridos:**
1. Implementar autenticación con JWT
2. Agregar tests unitarios
3. Dockerizar la aplicación
4. Deployar en la nube (Heroku, AWS, DigitalOcean)

¡Sigue practicando y construyendo! 🚀
