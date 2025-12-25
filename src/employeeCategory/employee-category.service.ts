import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeCategoryDto } from './dto/create-employee-category.dto';
import { UpdateEmployeeCategoryDto } from './dto/update-employee-category.dto';

@Injectable()
export class EmployeeCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeCategoryDto: CreateEmployeeCategoryDto) {
    return this.prisma.employeeCategory.create({
      data: createEmployeeCategoryDto,
    });
  }

  async findAll(page: number = 1, perPage: number = 25) {
    const skip = (page - 1) * perPage;
    const [data, total] = await Promise.all([
      this.prisma.employeeCategory.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employeeCategory.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const category = await this.prisma.employeeCategory.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!category) {
      throw new NotFoundException('Employee category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateEmployeeCategoryDto: UpdateEmployeeCategoryDto,
  ) {
    const category = await this.prisma.employeeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Employee category not found');
    }
    return this.prisma.employeeCategory.update({
      where: { id },
      data: updateEmployeeCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.employeeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Employee category not found');
    }
    await this.prisma.employeeCategory.delete({ where: { id } });
    return { message: 'Employee category deleted successfully' };
  }
}
