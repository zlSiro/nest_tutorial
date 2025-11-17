import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verificar si el nombre ya existe
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
      relations: ['products'],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, isActive: true },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)

    // Si se actualiza el nombre, verificar que no exista
    if (updateCategoryDto.nombre && updateCategoryDto.nombre !== category.nombre) {
      const categoriaExistente = await this.categoriesRepository.findOne({
        where: { nombre: updateCategoryDto.nombre}
      });

      if (categoriaExistente) {
        throw new ConflictException("Ya existe una categoria con ese nombre")
      }
    }

    Object.assign(category, updateCategoryDto)
    return await this.categoriesRepository.save(category)
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Verificar si tiene productos activos asociados
    const activeProducts = category.products?.filter((p) => p.isActive) || [];
    if (activeProducts.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${activeProducts.length} producto(s) activo(s) asociado(s)`,
      );
    }

    // Soft delete
    category.isActive = false;
    await this.categoriesRepository.save(category);
  }
}
