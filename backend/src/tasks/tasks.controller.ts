import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto, CreateCommentDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query() filters: FilterTasksDto) {
    return this.tasksService.findAll(req.user.id, filters);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req,
    @Query() filters: FilterTasksDto,
  ) {
    return this.tasksService.findByProject(projectId, req.user.id, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Request() req) {
    return this.tasksService.addComment(id, dto, req.user.id);
  }

  @Delete(':id/comments/:commentId')
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.tasksService.removeComment(id, commentId, req.user.id);
  }
}
