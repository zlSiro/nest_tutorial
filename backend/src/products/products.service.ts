import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verificar que la categoría existe
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${createProductDto.categoryId} no encontrada`,
      );
    }

    // Crear el producto sin el categoryId (que no es parte de la entidad)
    const { categoryId, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      category, // Asignar la relación
    });

    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { isActive: true },
      relations: ['category'], // Ya está en eager, pero lo dejamos explícito
    });
  }

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
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Si se actualiza la categoría, verificar que existe
    if (updateProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${updateProductDto.categoryId} no encontrada`,
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
    // Soft delete
    product.isActive = false;
    await this.productsRepository.save(product);
  }
}