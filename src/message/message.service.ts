import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: CreateMessageDto) {
    return this.prisma.message.create({
      data,
    });
  }

  async getMessagesByUser(senderId: string, receiverId?: string) {
    return this.prisma.message.findMany({
      where: {
        senderId,
        receiverId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
