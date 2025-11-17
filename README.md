# 📘 Tutorial NestJS - API REST de Usuarios

> **Guía Pedagógica Completa**: De Cero a API Funcional

Este proyecto es una API REST completa para gestión de usuarios, construida con NestJS, TypeORM y MySQL. Está diseñada como material educativo para estudiantes de ingeniería informática que quieren aprender desarrollo backend moderno.

---

## 📑 Tabla de Contenidos

1. [¿Qué construiremos?](#-qué-construiremos)
2. [Requisitos Previos](#-requisitos-previos)
3. [Conceptos Fundamentales](#-conceptos-fundamentales)
4. [Paso a Paso - Construcción del Proyecto](#-paso-a-paso---construcción-del-proyecto)
   - Paso 1-9: Módulo de Usuarios
   - **Paso 10: Categorías y Productos (Relaciones)**
5. [Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
6. [Testing de la API](#-testing-de-la-api)
7. [Errores Comunes y Soluciones](#-errores-comunes-y-soluciones)
8. [Mejoras Futuras](#-mejoras-futuras)
9. [Recursos Adicionales](#-recursos-adicionales)

---

## 🎯 ¿Qué construiremos?

Una API REST completa con tres módulos interconectados:

### ✅ Módulos Implementados
- 👤 **Users**: Gestión de usuarios con autenticación
- 🏷️ **Categories**: Categorías de productos  
- 🛒 **Products**: Productos relacionados con categorías

### ✨ Funcionalidades
- ✨ **CRUD Completo** para Users, Categories y Products
- 🔐 **Seguridad**: Contraseñas hasheadas con bcrypt
- ✔️ **Validaciones**: DTOs con class-validator
- 🗄️ **Base de Datos**: MySQL con TypeORM
- 🔗 **Relaciones**: OneToMany / ManyToOne entre entidades
- ⚡ **Eager Loading**: Carga automática de relaciones
- 🧹 **Soft Delete**: Eliminación lógica con validaciones
- 📝 **Timestamps**: Registro automático de fechas
- 🎯 **Query Params**: Filtrado de productos por categoría
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

## 🏪 PASO 10: Módulos de Categorías y Productos (Relaciones)

> **Objetivo**: Aprender a crear relaciones entre entidades (OneToMany / ManyToOne)

Ahora expandiremos la API con dos nuevos módulos que tienen relaciones entre sí:
- **Categories**: Categorías de productos
- **Products**: Productos que pertenecen a una categoría

### 📊 Diagrama de Relaciones

```
┌─────────────────────┐           ┌─────────────────────┐
│     CATEGORY        │           │      PRODUCT        │
├─────────────────────┤           ├─────────────────────┤
│ id (PK)             │<──────────│ id (PK)             │
│ nombre              │     1:N   │ nombre              │
│ descripcion         │           │ descripcion         │
│ isActive            │           │ precio (DECIMAL)    │
│ createdAt           │           │ stock (INT)         │
│ updatedAt           │           │ imageUrl            │
└─────────────────────┘           │ category_id (FK)    │
                                  │ isActive            │
                                  │ createdAt           │
                                  │ updatedAt           │
                                  └─────────────────────┘
```

**Relación**: Una categoría puede tener múltiples productos (1:N)

---

### 🛠️ 10.1: Crear Módulo de Categorías

```bash
nest g resource categories --no-spec
```

**Estructura generada:**
```
src/categories/
├── categories.controller.ts
├── categories.module.ts
├── categories.service.ts
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
└── entities/
    └── category.entity.ts
```

---

### 📄 10.2: Definir Category Entity con OneToMany

```typescript
// src/categories/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // 🔗 RELACIÓN OneToMany con Products
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Explicación de OneToMany:**
- `@OneToMany(() => Product, ...)`: Una categoría tiene muchos productos
- `product => product.category`: Cómo Product referencia a Category
- `products: Product[]`: Campo virtual (no es columna en BD)

---

### 📝 10.3: DTOs de Categories

```typescript
// src/categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
```

```typescript
// src/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

---

### 🔧 10.4: Categories Service (con validación de productos)

```typescript
// src/categories/categories.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Validar nombre duplicado
    const existingCategory = await this.categoriesRepository.findOne({
      where: { nombre: createCategoryDto.nombre },
    });

    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['products'], // Incluir productos
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, isActive: true },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(\`Categoría con ID \${id} no encontrada\`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Validar nombre duplicado si se cambia
    if (updateCategoryDto.nombre && updateCategoryDto.nombre !== category.nombre) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { nombre: updateCategoryDto.nombre },
      });

      if (existingCategory) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(\`Categoría con ID \${id} no encontrada\`);
    }

    // ⚠️ NO permitir eliminar si tiene productos activos
    const activeProducts = category.products?.filter((p) => p.isActive) || [];
    if (activeProducts.length > 0) {
      throw new BadRequestException(
        \`No se puede eliminar la categoría porque tiene \${activeProducts.length} producto(s) activo(s) asociado(s)\`,
      );
    }

    // Soft delete
    category.isActive = false;
    await this.categoriesRepository.save(category);
  }
}
```

**Regla de Negocio Importante:**
- No se puede eliminar una categoría con productos activos
- Esto mantiene la integridad referencial

---

### 🎮 10.5: Categories Controller

```typescript
// src/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
```

---

### 🔗 10.6: Categories Module (con export para Products)

```typescript
// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [TypeOrmModule], // ⚠️ Exportar para que Products pueda usar Category
})
export class CategoriesModule {}
```

---

### 🏪 10.7: Crear Módulo de Products

```bash
nest g resource products --no-spec
```

---

### 📦 10.8: Product Entity con ManyToOne

```typescript
// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // 💰 DECIMAL para precios (10 dígitos, 2 decimales)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  // 🔗 RELACIÓN ManyToOne con Category
  @ManyToOne(() => Category, (category) => category.products, {
    eager: true, // ⚡ Siempre trae la categoría automáticamente
  })
  @JoinColumn({ name: 'category_id' }) // Nombre de la FK en BD
  category: Category;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Conceptos importantes:**
- `@ManyToOne`: Muchos productos → una categoría
- `eager: true`: Trae la categoría automáticamente en cada query
- `@JoinColumn`: Especifica el nombre de la columna FK
- `decimal(10,2)`: Para precios monetarios (ej: 1299.99)

---

### 📝 10.9: Product DTOs con validaciones numéricas

```typescript
// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  // 💰 Precio: número con máximo 2 decimales, positivo
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio: number;

  // 📦 Stock: entero, mínimo 0 (permite 0 = sin stock)
  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  // 🔗 ID de la categoría (Foreign Key)
  @IsInt()
  @IsPositive()
  categoryId: number;
}
```

```typescript
// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

**Validaciones numéricas:**
- `@IsNumber({ maxDecimalPlaces: 2 })`: Máximo 2 decimales (precios)
- `@IsPositive()`: Mayor a 0
- `@IsInt()`: Número entero
- `@Min(0)`: Mínimo 0 (permite stock = 0)

---

### 🔧 10.10: Products Service (validación de categorías)

```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    
    // ⚠️ Inyectar repositorio de Category para validar
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 1️⃣ Validar que la categoría exista
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(
        \`Categoría con ID \${createProductDto.categoryId} no encontrada\`,
      );
    }

    // 2️⃣ Separar categoryId del DTO
    const { categoryId, ...productData } = createProductDto;

    // 3️⃣ Crear producto con la entidad Category completa
    const product = this.productsRepository.create({
      ...productData,
      category, // Asignar entidad, no ID
    });

    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { isActive: true },
      relations: ['category'], // Redundante por eager, pero explícito
    });
  }

  // 🔍 Filtrar productos por categoría
  async findByCategory(categoryId: number): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        category: { id: categoryId },
        isActive: true,
      },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(\`Producto con ID \${id} no encontrado\`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Si se actualiza la categoría, validar que exista
    if (updateProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException(
          \`Categoría con ID \${updateProductDto.categoryId} no encontrada\`,
        );
      }

      const { categoryId, ...productData } = updateProductDto;
      Object.assign(product, { ...productData, category });
    } else {
      Object.assign(product, updateProductDto);
    }

    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productsRepository.save(product);
  }
}
```

**Puntos clave:**
1. Inyecta dos repositorios: `Product` y `Category`
2. Valida que la categoría exista antes de crear/actualizar
3. Separa `categoryId` del DTO y asigna la entidad `Category` completa
4. Método adicional `findByCategory()` para filtrar

---

### 🎮 10.11: Products Controller con Query Params

```typescript
// src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // 🔍 GET /products o GET /products?categoryId=1
  @Get()
  findAll(@Query('categoryId', ParseIntPipe) categoryId?: number) {
    if (categoryId) {
      return this.productsService.findByCategory(categoryId);
    }
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
```

**Query Params:**
- `@Query('categoryId')`: Extrae `?categoryId=1` de la URL
- Permite filtrar productos por categoría
- Ejemplo: `GET /products?categoryId=1`

---

### 🔗 10.12: Products Module (importa Categories)

```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule, // ⚠️ Importar para acceder a Category repository
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**Dependencia entre módulos:**
- `ProductsModule` importa `CategoriesModule`
- Esto permite inyectar `Repository<Category>` en `ProductsService`
- `CategoriesModule` exporta `TypeOrmModule` para compartir el repositorio

---

### 🔌 10.13: Registrar Módulos en AppModule

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nest_users_db',
      synchronize: true,
      dropSchema: false,
      autoLoadEntities: true,
    }),
    UsersModule,
    CategoriesModule,   // ✅ Nuevo módulo
    ProductsModule,     // ✅ Nuevo módulo
  ],
})
export class AppModule {}
```

---

### 🧪 10.14: Probar los Endpoints con Relaciones

**1️⃣ Crear Categoría:**
```http
POST http://localhost:3000/categories
Content-Type: application/json

{
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos y tecnología"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos y tecnología",
  "isActive": true,
  "createdAt": "2025-11-17T10:00:00.000Z",
  "updatedAt": "2025-11-17T10:00:00.000Z"
}
```

---

**2️⃣ Crear Producto con Categoría:**
```http
POST http://localhost:3000/products
Content-Type: application/json

{
  "nombre": "Laptop HP Pavilion",
  "descripcion": "Laptop con procesador Intel Core i7, 16GB RAM, 512GB SSD",
  "precio": 1299.99,
  "stock": 15,
  "imageUrl": "https://example.com/laptop.jpg",
  "categoryId": 1
}
```

**Respuesta (con categoría por eager loading):**
```json
{
  "id": 1,
  "nombre": "Laptop HP Pavilion",
  "descripcion": "Laptop con procesador Intel Core i7, 16GB RAM, 512GB SSD",
  "precio": "1299.99",
  "stock": 15,
  "imageUrl": "https://example.com/laptop.jpg",
  "isActive": true,
  "createdAt": "2025-11-17T10:05:00.000Z",
  "updatedAt": "2025-11-17T10:05:00.000Z",
  "category": {
    "id": 1,
    "nombre": "Electrónica",
    "descripcion": "Productos electrónicos y tecnología",
    "isActive": true
  }
}
```

---

**3️⃣ Listar Categorías con sus Productos:**
```http
GET http://localhost:3000/categories
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Electrónica",
    "descripcion": "Productos electrónicos y tecnología",
    "isActive": true,
    "createdAt": "2025-11-17T10:00:00.000Z",
    "updatedAt": "2025-11-17T10:00:00.000Z",
    "products": [
      {
        "id": 1,
        "nombre": "Laptop HP Pavilion",
        "precio": "1299.99",
        "stock": 15
      },
      {
        "id": 2,
        "nombre": "Mouse Logitech G502",
        "precio": "79.99",
        "stock": 50
      }
    ]
  }
]
```

---

**4️⃣ Filtrar Productos por Categoría:**
```http
GET http://localhost:3000/products?categoryId=1
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Laptop HP Pavilion",
    "precio": "1299.99",
    "stock": 15,
    "category": {
      "id": 1,
      "nombre": "Electrónica"
    }
  },
  {
    "id": 2,
    "nombre": "Mouse Logitech G502",
    "precio": "79.99",
    "stock": 50,
    "category": {
      "id": 1,
      "nombre": "Electrónica"
    }
  }
]
```

---

**5️⃣ Intentar Eliminar Categoría con Productos:**
```http
DELETE http://localhost:3000/categories/1
```

**Respuesta (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "No se puede eliminar la categoría porque tiene 2 producto(s) activo(s) asociado(s)",
  "error": "Bad Request"
}
```

---

**6️⃣ Error: Categoría No Existe:**
```http
POST http://localhost:3000/products
Content-Type: application/json

{
  "nombre": "Producto Test",
  "precio": 100,
  "stock": 10,
  "categoryId": 999
}
```

**Respuesta (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Categoría con ID 999 no encontrada",
  "error": "Not Found"
}
```

---

### 📚 10.15: Conceptos Clave de Relaciones

#### 🔗 Tipos de Relaciones en TypeORM

**OneToMany (1:N):**
```typescript
// Una categoría tiene muchos productos
@OneToMany(() => Product, product => product.category)
products: Product[];
```

**ManyToOne (N:1):**
```typescript
// Muchos productos pertenecen a una categoría
@ManyToOne(() => Category, category => category.products)
category: Category;
```

**Relación Bidireccional:**
- Category → `@OneToMany` → products[]
- Product → `@ManyToOne` → category
- Ambas deben apuntar una a la otra

---

#### ⚡ Eager Loading

**Con `eager: true`:**
```typescript
@ManyToOne(() => Category, category => category.products, {
  eager: true, // ✅ Siempre trae la categoría
})
category: Category;
```

**Resultado:**
```typescript
const product = await productsRepository.findOne({ where: { id: 1 } });
// product.category está cargado automáticamente
console.log(product.category.nombre); // "Electrónica"
```

**Sin eager:**
```typescript
// Necesitas especificar relations manualmente
const product = await productsRepository.findOne({
  where: { id: 1 },
  relations: ['category'],
});
```

---

#### 💰 DECIMAL para Precios

**Problema con FLOAT:**
```javascript
0.1 + 0.2 === 0.3 // false (0.30000000000000004)
```

**Solución con DECIMAL:**
```typescript
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio: number;
```

- `precision: 10`: Total de dígitos
- `scale: 2`: Dígitos después del punto
- Ejemplo: 99999999.99

---

#### 🔑 Foreign Keys

**En TypeORM:**
```typescript
@ManyToOne(() => Category)
@JoinColumn({ name: 'category_id' })  // Nombre en BD
category: Category;
```

**En MySQL:**
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200),
  precio DECIMAL(10,2),
  category_id INT,  -- Foreign Key
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

---

#### 🔄 Compartir Repositorios entre Módulos

**Problema:**
```
ProductsService necesita validar que Category exista
→ Necesita Repository<Category>
→ Category está en CategoriesModule
```

**Solución:**

1. **CategoriesModule exporta:**
```typescript
exports: [TypeOrmModule]  // Comparte Category repository
```

2. **ProductsModule importa:**
```typescript
imports: [CategoriesModule]  // Recibe Category repository
```

3. **ProductsService inyecta:**
```typescript
constructor(
  @InjectRepository(Product) productsRepo,
  @InjectRepository(Category) categoriesRepo  // ✅ Ahora disponible
)
```

---

### ✅ Checklist: ¿Qué Aprendimos?

- ✅ Crear relaciones OneToMany / ManyToOne
- ✅ Usar `eager: true` para carga automática
- ✅ Validar existencia de entidades relacionadas
- ✅ Manejar Foreign Keys correctamente
- ✅ Usar `@JoinColumn` para nombres de columnas
- ✅ Trabajar con DECIMAL para precios
- ✅ Filtrar con query params (`?categoryId=1`)
- ✅ Prevenir eliminación con dependencias activas
- ✅ Compartir repositorios entre módulos
- ✅ Separar `categoryId` (DTO) de `category` (Entity)

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
- [ ] Agregar paginación en `findAll()` (usuarios, categorías, productos)
- [ ] Implementar filtros de búsqueda por múltiples campos
- [ ] Agregar más validaciones a los DTOs
- [ ] Implementar recuperación de contraseña
- [ ] Endpoint para productos con bajo stock
- [ ] Estadísticas: productos por categoría, categorías más populares

### Nivel Intermedio
- [ ] Autenticación con JWT (inicio de sesión)
- [ ] Roles y permisos (Admin, User, Manager)
- [ ] Subida de avatar de usuario e imágenes de productos
- [ ] Rate limiting (prevenir spam)
- [ ] Logging con Winston
- [ ] Relación ManyToMany: Products ↔ Tags
- [ ] Carrito de compras (Orders, OrderItems)
- [ ] Sistema de reviews/calificaciones para productos

### Nivel Avanzado
- [ ] Migraciones de base de datos (TypeORM migrations)
- [ ] Tests unitarios y E2E con Jest
- [ ] Documentación con Swagger/OpenAPI
- [ ] Caché con Redis
- [ ] Implementar GraphQL como alternativa a REST
- [ ] Websockets para notificaciones en tiempo real
- [ ] Microservicios con @nestjs/microservices
- [ ] Implementar búsqueda full-text con Elasticsearch

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

### Módulo Users

**Ejercicio 1: Agregar Campo "Edad"**
1. Agrega un campo `edad: number` a la entity
2. Agrega validaciones en el DTO (`@IsNumber()`, `@Min(18)`, `@Max(120)`)
3. Actualiza el service y controller si es necesario
4. Prueba con Postman

**Ejercicio 2: Implementar Búsqueda por Email**
1. Crea un endpoint `GET /users/search?email=xxx`
2. Implementa el método en el service
3. Usa `@Query()` en el controller
4. Prueba la funcionalidad

**Ejercicio 3: Agregar Paginación**
1. Crea un endpoint `GET /users?page=1&limit=10`
2. Usa `take` y `skip` en TypeORM
3. Devuelve también el total de registros
4. Implementa metadatos de paginación en la respuesta

---

### Módulo Categories & Products

**Ejercicio 4: Ordenamiento de Productos**
1. Agrega query param: `GET /products?sortBy=price&order=asc`
2. Implementa ordenamiento por precio, nombre, stock
3. Permite orden ascendente (asc) y descendente (desc)

**Ejercicio 5: Rango de Precios**
1. Endpoint: `GET /products?minPrice=100&maxPrice=500`
2. Usa `Between()` de TypeORM
3. Combina con filtro de categoría

**Ejercicio 6: Búsqueda por Nombre**
1. Endpoint: `GET /products?search=laptop`
2. Busca en nombre y descripción
3. Usa `Like()` de TypeORM con `%search%`

**Ejercicio 7: Productos con Bajo Stock**
1. Endpoint: `GET /products/low-stock?threshold=10`
2. Retorna productos con stock menor al umbral
3. Útil para gestión de inventario

**Ejercicio 8: Agregar Reviews a Productos**
1. Crea entidad `Review` con rating (1-5) y comentario
2. Relación OneToMany: Product → Reviews
3. Implementa CRUD de reviews
4. Calcula rating promedio por producto

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
- ✅ DTOs y validaciones con class-validator
- ✅ CRUD completo para múltiples entidades
- ✅ **Relaciones entre entidades (OneToMany / ManyToOne)**
- ✅ **Eager Loading y lazy loading**
- ✅ **Foreign Keys y validaciones de integridad**
- ✅ Seguridad básica (bcrypt para contraseñas)
- ✅ Manejo de errores HTTP apropiados
- ✅ Soft delete y timestamps automáticos
- ✅ **Query params para filtrado**
- ✅ **Compartir repositorios entre módulos**
- ✅ **Validaciones numéricas (DECIMAL, precios, stock)**

**Próximos pasos sugeridos:**
1. Implementar autenticación con JWT (login/logout)
2. Agregar tests unitarios y E2E
3. Implementar un módulo de Orders (pedidos) que relacione Users y Products
4. Dockerizar la aplicación (Docker + Docker Compose)
5. Documentar la API con Swagger/OpenAPI
6. Deployar en la nube (Heroku, AWS, DigitalOcean, Railway)

¡Sigue practicando y construyendo! 🚀

---

**📊 Proyecto Completo:**

Ahora tienes una API REST con:
- 3 módulos funcionales (Users, Categories, Products)
- Relaciones bidireccionales
- Validaciones robustas
- Arquitectura escalable
- Código bien documentado

**¡Este es un excelente portfolio piece para mostrar a empleadores!** 💼
