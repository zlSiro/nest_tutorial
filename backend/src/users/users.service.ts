/**
 * ====================================================================
 * USERS.SERVICE.TS - SERVICIO DE LÓGICA DE NEGOCIO DE USUARIOS
 * ====================================================================
 * 
 * El Service es el CORAZÓN de la aplicación donde vive la lógica de negocio.
 * 
 * RESPONSABILIDADES:
 * - Implementar la lógica de negocio
 * - Interactuar con la base de datos a través de Repositories
 * - Validar reglas de negocio (email único, usuario activo, etc.)
 * - Manejar errores y lanzar excepciones apropiadas
 * - Transformar datos (hashear contraseñas, formatear responses, etc.)
 * 
 * ❌ NO DEBE: Manejar directamente HTTP (eso es del Controller)
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Decorador @Injectable - Marca esta clase como un Provider
 * 
 * ¿Qué significa Injectable?
 * - NestJS puede inyectar esta clase en otros componentes
 * - Forma parte del sistema de Inyección de Dependencias
 * - NestJS gestiona su ciclo de vida (creación, scope, destrucción)
 * 
 * Por defecto, los servicios son SINGLETON:
 * - Se crea una sola instancia por aplicación
 * - Esa instancia se reutiliza en todos los lugares donde se inyecta
 */
@Injectable()
export class UsersService {
  /**
   * INYECCIÓN DEL REPOSITORY
   * 
   * @InjectRepository(User) - Le dice a NestJS que inyecte el Repository de User
   * 
   * Repository<User> es proporcionado por TypeORM y nos da métodos como:
   * - find(): Buscar múltiples registros
   * - findOne(): Buscar un registro
   * - save(): Guardar o actualizar
   * - remove(): Eliminar físicamente
   * - create(): Crear una instancia (no guarda en BD)
   * - Y muchos más...
   * 
   * Es como tener un "asistente" que conoce todas las operaciones
   * de base de datos que podemos hacer con la tabla 'users'
   */
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * ================================================================
   * 📝 MÉTODO: CREAR USUARIO
   * ================================================================
   * 
   * Este método implementa la lógica completa para crear un usuario:
   * 1. Verifica que el email no exista
   * 2. Hashea la contraseña por seguridad
   * 3. Crea y guarda el usuario en la BD
   * 
   * @param createUserDto - Datos del usuario a crear (validados por el DTO)
   * @returns Promise<User> - El usuario creado (sin la contraseña)
   * @throws ConflictException - Si el email ya existe
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // PASO 1: Verificar si el email ya está registrado
    // ------------------------------------------------
    // findOne() busca un registro que cumpla las condiciones
    // where: { email: ... } es como: SELECT * FROM users WHERE email = '...'
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    // Si encontramos un usuario con ese email, lanzamos un error
    if (existingUser) {
      // ConflictException genera un error HTTP 409 (Conflict)
      // Es el código apropiado para "el recurso ya existe"
      throw new ConflictException('El correo ya está registrado');
    }

    // PASO 2: Hashear la contraseña
    // ------------------------------------------------
    // ⚠️ NUNCA guardes contraseñas en texto plano
    // 
    // bcrypt.hash() genera un hash de la contraseña:
    // - Primer parámetro: la contraseña en texto plano
    // - Segundo parámetro: "salt rounds" (10 es un buen balance)
    //   Más rounds = más seguro pero más lento
    // 
    // Ejemplo:
    // Input:  "password123"
    // Output: "$2b$10$abcdefghijklmnopqrstuvwxyz..." (60 caracteres)
    // 
    // Ventajas de bcrypt:
    // - Cada hash es único (incluso con la misma contraseña)
    // - Es computacionalmente costoso (dificulta ataques de fuerza bruta)
    // - Tiene salt incorporado (previene rainbow tables)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // PASO 3: Crear la instancia del usuario
    // ------------------------------------------------
    // create() crea una instancia de User pero NO la guarda en BD aún
    // 
    // Usamos el spread operator (...) para copiar todas las propiedades
    // del DTO, y luego sobrescribimos el password con el hash
    const newUser = this.usersRepository.create({
      ...createUserDto,           // email, nombre, apellido, password (original)
      password: hashedPassword,   // Sobrescribimos con el password hasheado
    });

    // PASO 4: Guardar en la base de datos
    // ------------------------------------------------
    // save() guarda el usuario en la BD y retorna el usuario guardado
    // TypeORM automáticamente:
    // - Genera el SQL INSERT
    // - Asigna el ID autogenerado
    // - Establece createdAt y updatedAt
    // - Devuelve el objeto completo
    return this.usersRepository.save(newUser);
  }

  /**
   * ================================================================
   * 📋 MÉTODO: LISTAR TODOS LOS USUARIOS ACTIVOS
   * ================================================================
   * 
   * Devuelve un array con todos los usuarios que tienen isActive = true
   * 
   * IMPORTANTE: Usa 'select' para excluir campos sensibles como password
   * 
   * @returns Promise<User[]> - Array de usuarios activos (sin contraseñas)
   */
  async findAll(): Promise<User[]> {
    // find() busca todos los registros que cumplan las condiciones
    // where: { isActive: true } → Solo usuarios activos
    // select: [...] → Solo devuelve estos campos (excluye password)
    // 
    // SQL equivalente:
    // SELECT id, nombre, apellido, email, created_at, updated_at 
    // FROM users 
    // WHERE is_active = true
    return await this.usersRepository.find({
      where: { isActive: true },
      select: [
        'id',
        'nombre',
        'apellido',
        'email',
        'createdAt',
        'updatedAt',
      ]
    });
  }

  /**
   * ================================================================
   * 🔍 MÉTODO: BUSCAR UN USUARIO POR ID
   * ================================================================
   * 
   * Busca un usuario específico por su ID.
   * Solo retorna usuarios activos (no los eliminados con soft delete)
   * 
   * @param id - ID del usuario a buscar
   * @returns Promise<User> - El usuario encontrado
   * @throws NotFoundException - Si el usuario no existe o no está activo
   */
  async findOne(id: number): Promise<User> {
    // findOne() busca un solo registro
    // where: { id, isActive: true } es shorthand para:
    // where: { id: id, isActive: true }
    // 
    // SQL equivalente:
    // SELECT * FROM users WHERE id = ? AND is_active = true
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
    });

    // Si no encontramos el usuario, lanzamos un error 404
    if (!user) {
      // NotFoundException genera un error HTTP 404 (Not Found)
      // Es el código apropiado para "el recurso no existe"
      // 
      // Usamos template literals (``) para crear un mensaje dinámico
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * ================================================================
   * ✏️ MÉTODO: ACTUALIZAR UN USUARIO
   * ================================================================
   * 
   * Actualiza los campos especificados de un usuario.
   * Valida que no haya conflictos con emails existentes.
   * 
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Campos a actualizar (todos opcionales)
   * @returns Promise<User> - El usuario actualizado
   * @throws NotFoundException - Si el usuario no existe
   * @throws ConflictException - Si el nuevo email ya existe
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // PASO 1: Verificar que el usuario existe
    // ------------------------------------------------
    // Reutilizamos findOne() que ya implementa la lógica de
    // verificación y lanza NotFoundException si no existe
    const user = await this.findOne(id);

    // PASO 2: Validar unicidad del email si se está actualizando
    // ------------------------------------------------
    // Verificamos dos cosas:
    // 1. Que updateUserDto incluya un email
    // 2. Que sea diferente al email actual del usuario
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      // Buscamos si ya existe otro usuario con ese email
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      // Si existe otro usuario con ese email, no podemos actualizar
      if (existingUser) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    // PASO 3: Hashear la nueva contraseña si se está actualizando
    // ------------------------------------------------
    // Si el DTO incluye una contraseña, la hasheamos
    // ⚠️ IMPORTANTE: Nunca guardes contraseñas en texto plano
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // PASO 4: Aplicar los cambios al usuario
    // ------------------------------------------------
    // Object.assign(target, source) copia todas las propiedades de
    // updateUserDto al objeto user
    // 
    // Ejemplo:
    // user = { id: 1, nombre: "Juan", email: "juan@example.com", ... }
    // updateUserDto = { nombre: "Juan Carlos" }
    // Resultado: user.nombre ahora es "Juan Carlos"
    Object.assign(user, updateUserDto);

    // PASO 5: Guardar los cambios en la base de datos
    // ------------------------------------------------
    // save() detecta que el usuario ya tiene un ID, así que hace UPDATE
    // TypeORM automáticamente actualiza el campo updatedAt
    // 
    // SQL equivalente:
    // UPDATE users SET nombre = ?, ... , updated_at = NOW() WHERE id = ?
    return this.usersRepository.save(user);

  }

  /**
   * ================================================================
   * 🗑️ MÉTODO: ELIMINAR UN USUARIO (SOFT DELETE)
   * ================================================================
   * 
   * Implementa un "soft delete" (eliminación lógica):
   * - NO elimina físicamente el registro de la BD
   * - Solo marca isActive = false
   * - Permite mantener historial y auditoría
   * - El usuario ya no aparecerá en findAll() ni findOne()
   * 
   * @param id - ID del usuario a eliminar
   * @returns Promise<void> - No devuelve nada (el controller envía 204)
   * @throws NotFoundException - Si el usuario no existe
   * 
   * VENTAJAS DEL SOFT DELETE:
   * - Auditoría: Mantienes registro de quién existió
   * - Recuperación: Puedes "reactivar" usuarios
   * - Integridad: No rompes relaciones con otras tablas
   * - Legal: Cumplimiento de regulaciones (GDPR con matices)
   * 
   * ALTERNATIVA (Hard Delete):
   * Para eliminar físicamente usarías:
   * await this.usersRepository.remove(user);
   */
  async remove (id: number): Promise<void> {
    // PASO 1: Verificar que el usuario existe
    // ------------------------------------------------
    // Reutilizamos findOne() para validación
    const user = await this.findOne(id);
    
    // PASO 2: Marcar como inactivo (soft delete)
    // ------------------------------------------------
    // Simplemente cambiamos la bandera isActive a false
    user.isActive = false;
    
    // PASO 3: Guardar el cambio en la base de datos
    // ------------------------------------------------
    // save() actualiza el registro en la BD
    // 
    // SQL equivalente:
    // UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ?
    await this.usersRepository.save(user);
    
    // No retornamos nada (void) porque el controller
    // enviará un 204 No Content
  }
}

/**
 * ====================================================================
 * 📚 CONCEPTOS CLAVE Y MEJORES PRÁCTICAS
 * ====================================================================
 * 
 * 1. SEPARACIÓN DE RESPONSABILIDADES:
 *    ✅ Service: Lógica de negocio, validaciones, transformaciones
 *    ❌ Service: NO maneja HTTP, rutas, status codes
 * 
 * 2. MANEJO DE ERRORES:
 *    - NotFoundException (404): Recurso no encontrado
 *    - ConflictException (409): Conflicto (duplicados, etc.)
 *    - BadRequestException (400): Datos inválidos
 *    - UnauthorizedException (401): No autenticado
 *    - ForbiddenException (403): No tiene permisos
 * 
 * 3. SEGURIDAD:
 *    ✅ Hashear contraseñas con bcrypt
 *    ✅ Validar datos de entrada (DTOs)
 *    ✅ No exponer contraseñas en responses (usar select)
 *    ❌ NUNCA guardar contraseñas en texto plano
 * 
 * 4. PATRONES DE DISEÑO:
 *    - Repository Pattern: Abstrae el acceso a datos
 *    - Dependency Injection: Desacoplamiento y testabilidad
 *    - DTO Pattern: Validación y transformación de datos
 *    - Soft Delete: Eliminación lógica vs física
 * 
 * 5. ASYNC/AWAIT:
 *    - Todas las operaciones de BD son asíncronas
 *    - Usar async/await para código más legible
 *    - Manejar errores con try/catch cuando sea necesario
 * 
 * 6. REPOSITORY METHODS COMUNES:
 *    - find(options): Buscar múltiples registros
 *    - findOne(options): Buscar un registro
 *    - findAndCount(options): Buscar y contar (para paginación)
 *    - create(data): Crear instancia (no guarda)
 *    - save(entity): Guardar o actualizar
 *    - remove(entity): Eliminar físicamente
 *    - update(criteria, data): Actualizar sin cargar entidad
 *    - delete(criteria): Eliminar sin cargar entidad
 * 
 * 7. MEJORAS FUTURAS:
 *    - Implementar paginación en findAll()
 *    - Agregar filtros de búsqueda
 *    - Implementar caché (Redis)
 *    - Usar transacciones para operaciones complejas
 *    - Agregar logging para auditoría
 *    - Implementar eventos (EventEmitter) para acciones
 */
