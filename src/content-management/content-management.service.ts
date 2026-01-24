import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentManagementService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CONTENT MANAGEMENT CRUD
  // ============================================

  async create(data: any) {
    const {
      userId,
      clientId, // The client this content is for
      companyId,
      companyName,
      date,
      contentTitle,
      occasion,
      caption,
      tags,
      files,
      inspareFiles,
      inspareUrl,
      employeeComment,
      internalComments,
      role = 'pending',
      status = 'draft',
    } = data;

    return this.prisma.contentManagement.create({
      data: {
        userId, // Creator/Manager ID
        clientId, // Client ID (who this content is for)
        companyId,
        companyName,
        date: new Date(date),
        contentTitle,
        occasion,
        caption,
        tags: Array.isArray(tags)
          ? tags
          : tags
            ? tags.split(',').map((tag) => tag.trim())
            : [],
        files: files || [],
        inspareFiles: inspareFiles || files || [], // Use inspareFiles or fallback to files
        employeeComment,
        internalComments,
        role,
        status,
      },
    });
  }

  async findAll() {
    return this.prisma.contentManagement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.contentManagement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.contentManagement.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async update(id: string, data: any) {
    // Handle date conversion if provided
    if (data.date) {
      data.date = new Date(data.date);
    }

    // Handle dueDate conversion if provided
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }

    // Handle tags array conversion
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((tag) => tag.trim());
    }

    // Handle files array - ensure it's an array
    if (data.files !== undefined && !Array.isArray(data.files)) {
      data.files = [];
    }

    // Handle inspareFiles array
    if (data.inspareFiles !== undefined && !Array.isArray(data.inspareFiles)) {
      data.inspareFiles = [];
    }

    // Handle inspareUrl array
    if (data.inspareUrl !== undefined && !Array.isArray(data.inspareUrl)) {
      data.inspareUrl = [];
    }

    return this.prisma.contentManagement.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.contentManagement.delete({
      where: { id },
    });
  }

  // ============================================
  // ADDITIONAL QUERIES
  // ============================================

  async findByStatus(status: string) {
    return this.prisma.contentManagement.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRole(role: string) {
    return this.prisma.contentManagement.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRoleAndStatus(role: string, status: string) {
    return this.prisma.contentManagement.findMany({
      where: {
        role,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.contentManagement.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.contentManagement.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ============================================
  // CLIENT-WISE CONTENT FILTERING
  // ============================================

  async findByCompanyAndUser(companyId: string, clientId: string) {
    return this.prisma.contentManagement.findMany({
      where: {
        companyId,
        clientId, // Filter by client ID instead of user ID
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // EMPLOYEE ASSIGNED CONTENT
  // ============================================

  async findByAssignId(assignId: string) {
    return this.prisma.contentManagement.findMany({
      where: {
        assignId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
