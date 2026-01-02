import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAttendanceDto,
  AttendanceStatus,
} from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { checkIn, checkOut, date, ...rest } = createAttendanceDto;

    // Convert date strings to Date objects
    const attendanceData: any = {
      ...rest,
      date: new Date(date),
    };

    if (checkIn) {
      attendanceData.checkIn = new Date(checkIn);
    }

    if (checkOut) {
      attendanceData.checkOut = new Date(checkOut);
    }

    const attendance = await this.prisma.attendance.create({
      data: attendanceData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'Attendance created successfully',
      attendance,
    };
  }

  async findAll(
    userId?: string,
    date?: string,
    status?: AttendanceStatus,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    perPage: number = 100,
  ) {
    const skip = (page - 1) * perPage;
    const take = perPage;

    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;

    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async findByUser(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id); // Check if exists

    const { checkIn, checkOut, date, ...rest } = updateAttendanceDto;

    const updateData: any = { ...rest };

    if (date) {
      updateData.date = new Date(date);
    }

    if (checkIn) {
      updateData.checkIn = new Date(checkIn);
    }

    if (checkOut) {
      updateData.checkOut = new Date(checkOut);
    }

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'Attendance updated successfully',
      attendance,
    };
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.attendance.delete({
      where: { id },
    });

    return {
      message: 'Attendance deleted successfully',
    };
  }

  // Get attendance statistics
  async getStats(userId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (userId) where.userId = userId;

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [total, present, absent, late, onLeave] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: 'present' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'absent' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'late' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'on_leave' } }),
    ]);

    return {
      total,
      present,
      absent,
      late,
      onLeave,
      presentPercentage: total > 0 ? ((present / total) * 100).toFixed(2) : '0',
      absentPercentage: total > 0 ? ((absent / total) * 100).toFixed(2) : '0',
    };
  }
}
