import {
  IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class FilterTasksDto {
  @IsString()
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateCommentDto {
  @IsString()
  content: string;
}
