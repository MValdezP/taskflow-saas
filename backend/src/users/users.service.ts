import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, avatar: true, createdAt: true,
        ownedProjects: { select: { id: true, name: true, color: true } },
        assignedTasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true, title: true, status: true, priority: true, dueDate: true },
          take: 10,
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getStats(userId: string) {
    const [totalTasks, doneTasks, inProgressTasks, overdueTasks] = await Promise.all([
      this.prisma.task.count({ where: { assigneeId: userId } }),
      this.prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } }),
      this.prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return { totalTasks, doneTasks, inProgressTasks, overdueTasks };
  }

  async getDashboardStats() {
    const [totalUsers, totalProjects, totalTasks, tasksByStatus] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count({ where: { archived: false } }),
      this.prisma.task.count(),
      this.prisma.task.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const tasksByPriority = await this.prisma.task.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });

    return { totalUsers, totalProjects, totalTasks, tasksByStatus, tasksByPriority };
  }
}
