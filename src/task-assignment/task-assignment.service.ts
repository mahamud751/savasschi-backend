import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskAssignmentDto,
  UpdateTaskAssignmentDto,
  TaskStatus,
  TaskPriority,
} from '../dto/task-assignment.dto';

@Injectable()
export class TaskAssignmentService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskAssignmentDto, userId: string) {
    try {
      // Verify that the client business exists
      const clientBusiness = await this.prisma.clientBusiness.findUnique({
        where: { id: createTaskDto.companyId },
      });

      if (!clientBusiness) {
        throw new BadRequestException('Client business not found');
      }

      // Verify that the assignee user exists
      const assignee = await this.prisma.user.findUnique({
        where: { id: createTaskDto.assignToId },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee user not found');
      }

      const task = await this.prisma.taskAssignment.create({
        data: {
          ...createTaskDto,
          dueDate: new Date(createTaskDto.dueDate),
          status: TaskStatus.ASSIGNED,
          priority: createTaskDto.priority || TaskPriority.MEDIUM,
          createdBy: userId,
        },
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return task;
    } catch (error) {
      throw error;
    }
  }

  async getAllTasks(userId?: string, status?: string, companyId?: string) {
    try {
      const where: any = {};

      if (userId) {
        where.OR = [{ createdBy: userId }, { assignToId: userId }];
      }

      if (status) {
        where.status = status;
      }

      if (companyId) {
        where.companyId = companyId;
      }

      const tasks = await this.prisma.taskAssignment.findMany({
        where,
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  async getTaskById(id: string) {
    try {
      const task = await this.prisma.taskAssignment.findUnique({
        where: { id },
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskAssignmentDto,
    userId: string,
  ) {
    try {
      const existingTask = await this.prisma.taskAssignment.findUnique({
        where: { id },
      });

      if (!existingTask) {
        throw new NotFoundException('Task not found');
      }

      // Check if user is authorized to update (creator or assignee)
      if (
        existingTask.createdBy !== userId &&
        existingTask.assignToId !== userId
      ) {
        throw new BadRequestException('Not authorized to update this task');
      }

      const updateData: any = { ...updateTaskDto };

      if (updateTaskDto.dueDate) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      const task = await this.prisma.taskAssignment.update({
        where: { id },
        data: updateData,
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return task;
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(id: string, userId: string) {
    try {
      const task = await this.prisma.taskAssignment.findUnique({
        where: { id },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Only creator can delete task
      if (task.createdBy !== userId) {
        throw new BadRequestException('Not authorized to delete this task');
      }

      await this.prisma.taskAssignment.delete({
        where: { id },
      });

      return { message: 'Task deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getTasksByCompanyId(companyId: string) {
    try {
      const tasks = await this.prisma.taskAssignment.findMany({
        where: { companyId },
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  async getTasksByAssignee(assignToId: string) {
    try {
      const tasks = await this.prisma.taskAssignment.findMany({
        where: { assignToId },
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  async getMyCreatedTasks(createdBy: string) {
    try {
      const tasks = await this.prisma.taskAssignment.findMany({
        where: { createdBy },
        include: {
          clientBusiness: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }
}
