import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';
import {
  CreateTaskAssignmentDto,
  UpdateTaskAssignmentDto,
} from '../dto/task-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('task-assignment')
@UseGuards(JwtAuthGuard)
export class TaskAssignmentController {
  constructor(private readonly taskAssignmentService: TaskAssignmentService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskAssignmentDto, @Req() req) {
    const userId = req.user.userId;
    return this.taskAssignmentService.createTask(createTaskDto, userId);
  }

  @Get()
  async getAllTasks(
    @Req() req,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    const userId = req.user.userId;
    return this.taskAssignmentService.getAllTasks(userId, status, companyId);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.taskAssignmentService.getTaskById(id);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskAssignmentDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.taskAssignmentService.updateTask(id, updateTaskDto, userId);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.taskAssignmentService.deleteTask(id, userId);
  }

  @Get('company/:companyId')
  async getTasksByCompanyId(@Param('companyId') companyId: string) {
    return this.taskAssignmentService.getTasksByCompanyId(companyId);
  }

  @Get('assignee/:assignToId')
  async getTasksByAssignee(@Param('assignToId') assignToId: string) {
    return this.taskAssignmentService.getTasksByAssignee(assignToId);
  }

  @Get('my/created')
  async getMyCreatedTasks(@Req() req) {
    const userId = req.user.userId;
    return this.taskAssignmentService.getMyCreatedTasks(userId);
  }

  @Get('my/assigned')
  async getMyAssignedTasks(@Req() req) {
    const userId = req.user.userId;
    return this.taskAssignmentService.getTasksByAssignee(userId);
  }
}
