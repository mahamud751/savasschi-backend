import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientBusinessService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CLIENT BUSINESS CRUD
  // ============================================
  async createOrUpdate(data: any) {
    const { userId, ...rest } = data;

    // Check if profile exists
    const existing = await this.prisma.clientBusiness.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing
      return this.prisma.clientBusiness.update({
        where: { userId },
        data: rest,
      });
    } else {
      // Create new
      return this.prisma.clientBusiness.create({
        data: { userId, ...rest },
      });
    }
  }

  async findByUserId(userId: string) {
    const clientBusiness = await this.prisma.clientBusiness.findUnique({
      where: { userId },
      include: {
        socialPosts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!clientBusiness) {
      throw new NotFoundException(
        `Client business not found for user ${userId}`,
      );
    }

    return clientBusiness;
  }

  async findOne(id: string) {
    const clientBusiness = await this.prisma.clientBusiness.findUnique({
      where: { id },
      include: {
        socialPosts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!clientBusiness) {
      throw new NotFoundException(`Client business with ID ${id} not found`);
    }

    return clientBusiness;
  }

  async update(id: string, data: any) {
    return this.prisma.clientBusiness.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.clientBusiness.delete({
      where: { id },
    });
  }

  // ============================================
  // SOCIAL MEDIA POSTS
  // ============================================
  async createSocialPost(clientBusinessId: string, data: any) {
    return this.prisma.socialMediaPost.create({
      data: {
        clientBusinessId,
        ...data,
      },
    });
  }

  async getSocialPosts(clientBusinessId: string) {
    return this.prisma.socialMediaPost.findMany({
      where: { clientBusinessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSocialPost(postId: string, data: any) {
    return this.prisma.socialMediaPost.update({
      where: { id: postId },
      data,
    });
  }

  async deleteSocialPost(postId: string) {
    return this.prisma.socialMediaPost.delete({
      where: { id: postId },
    });
  }
}
