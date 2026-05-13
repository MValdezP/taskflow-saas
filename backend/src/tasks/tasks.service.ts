import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto, CreateCommentDto } from './dto/task.dto';

const TASK_SELECT = {
  id: true, title: true, description: true, status: true,
  priority: true, dueDate: true, position: true, createdAt: true, updatedAt: true,
  project: { select: { id: true, name: true, color: true } },
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  creator: { select: { id: true, name: true, avatar: true } },
  comments: {
    select: {
      id: true, content: true, createdAt: true,
      author: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { comments: true } },
};

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async assertMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new ForbiddenException('Not a project member');
  }

  async create(dto: CreateTaskDto, userId: string) {
    await this.assertMember(dto.projectId, userId);
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'TODO',
        priority: dto.priority ?? 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position: dto.position ?? 0,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        creatorId: userId,
      },
      select: TASK_SELECT,
    });
  }

  async findAll(userId: string, filters: FilterTasksDto) {
    const where: any = {
      project: { members: { some: { userId } } },
    };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      select: TASK_SELECT,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findByProject(projectId: string, userId: string, filters: FilterTasksDto) {
    await this.assertMember(projectId, userId);
    const where: any = { projectId };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      select: TASK_SELECT,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: TASK_SELECT,
    });
    if (!task) throw new NotFoundException('Task not found');
    await this.assertMember(task.project.id, userId);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { projectId: true } });
    if (!task) throw new NotFoundException('Task not found');
    await this.assertMember(task.projectId, userId);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      select: TASK_SELECT,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { projectId: true, creatorId: true } });
    if (!task) throw new NotFoundException('Task not found');
    await this.assertMember(task.projectId, userId);

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async addComment(taskId: string, dto: CreateCommentDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
    if (!task) throw new NotFoundException('Task not found');
    await this.assertMember(task.projectId, userId);

    return this.prisma.comment.create({
      data: { content: dto.content, taskId, authorId: userId },
      select: {
        id: true, content: true, createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async removeComment(taskId: string, commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, taskId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not the comment author');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }
}
