import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';

const PROJECT_SELECT = {
  id: true,
  name: true,
  description: true,
  color: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, email: true, avatar: true } },
  members: {
    select: {
      role: true,
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  },
  _count: { select: { tasks: true } },
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        ownerId: userId,
        members: { create: { userId, role: 'ADMIN' } },
      },
      select: PROJECT_SELECT,
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        archived: false,
        members: { some: { userId } },
      },
      select: PROJECT_SELECT,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, members: { some: { userId } } },
      select: {
        ...PROJECT_SELECT,
        tasks: {
          select: {
            id: true, title: true, status: true, priority: true,
            dueDate: true, position: true, createdAt: true,
            assignee: { select: { id: true, name: true, avatar: true } },
            creator: { select: { id: true, name: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.assertAdmin(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      select: PROJECT_SELECT,
    });
  }

  async archive(id: string, userId: string) {
    await this.assertAdmin(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: { archived: true },
      select: { id: true, archived: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.assertAdmin(id, userId);
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  }

  async addMember(projectId: string, dto: AddMemberDto, requesterId: string) {
    await this.assertAdmin(projectId, requesterId);
    return this.prisma.projectMember.create({
      data: { projectId, userId: dto.userId },
    });
  }

  async removeMember(projectId: string, memberId: string, requesterId: string) {
    await this.assertAdmin(projectId, requesterId);
    await this.prisma.projectMember.deleteMany({
      where: { projectId, userId: memberId },
    });
    return { message: 'Member removed' };
  }

  private async assertAdmin(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId, role: 'ADMIN' },
    });
    if (!member) throw new ForbiddenException('Admin access required');
  }
}
