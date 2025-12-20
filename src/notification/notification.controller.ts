import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateNotificationDto,
  UpdateNotificationStatusDto,
} from './dto/create-notification.dto';
import { AdminRoleGuard } from 'src/auth/AdminRoleGuard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification successfully created.',
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification' })
  @ApiResponse({ status: 200, description: 'Return all notification.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
    @Query('email') email?: string,
    @Query('status') status?: string,
  ) {
    return this.notificationService.findAll(page, perPage, email, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiParam({ name: 'id', description: 'ID of the notification to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the notification.' })
  @ApiResponse({ status: 404, description: 'notification not found.' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Get('user/:email')
  @ApiOperation({
    summary: 'Get all notifications for a specific user by email',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications for the user by email.',
  })
  async getNotificationsByEmail(@Param('email') email: string) {
    return this.notificationService.getNotificationsForUserByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification status (read/unread)' })
  @ApiResponse({
    status: 200,
    description: 'Notification status successfully updated.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateNotificationStatusDto,
  ) {
    return this.notificationService.updateNotificationStatus(
      id,
      updateStatusDto,
    );
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'ID of the notification to delete' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'notification not found.' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
