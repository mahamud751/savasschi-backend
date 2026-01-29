import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SendGroupMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatGroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(createGroupDto: CreateGroupDto) {
    return this.prisma.chatGroup.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        type: createGroupDto.type || 'department',
        createdBy: createGroupDto.createdBy,
        members: {
          create: {
            userId: createGroupDto.createdBy,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                photos: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getGroupsForUser(userId: string) {
    return this.prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                photos: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getGroupById(groupId: string) {
    return this.prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                photos: true,
                phone: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                photos: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async addMember(addMemberDto: AddMemberDto) {
    const { groupId, userId, role } = addMemberDto;

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: role || 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photos: true,
          },
        },
        group: true,
      },
    });
  }

  async removeMember(groupId: string, userId: string) {
    return this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  async sendGroupMessage(sendMessageDto: SendGroupMessageDto) {
    const { groupId, senderId, content, type } = sendMessageDto;

    return this.prisma.groupMessage.create({
      data: {
        groupId,
        senderId,
        content,
        type: type || 'text',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            photos: true,
          },
        },
        group: true,
      },
    });
  }

  async getGroupMessages(groupId: string) {
    return this.prisma.groupMessage.findMany({
      where: { groupId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getUserGroups(userId: string) {
    // Get all groups where user is a member
    const groups = await this.prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                photos: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Add last message for each group
    const groupsWithLastMessage = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await this.prisma.groupMessage.findFirst({
          where: { groupId: group.id },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          ...group,
          lastMessage,
        };
      }),
    );

    return groupsWithLastMessage;
  }
}
