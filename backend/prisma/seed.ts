import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@taskflow.dev',
      name: 'Alice Johnson',
      password: hashedPassword,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@taskflow.dev',
      name: 'Bob Smith',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@taskflow.dev',
      name: 'Carol White',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'TaskFlow MVP',
      description: 'Build the minimum viable product for TaskFlow platform',
      color: '#6366f1',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: carol.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Marketing Website',
      description: 'Redesign the company marketing website',
      color: '#ec4899',
      ownerId: bob.id,
      members: {
        create: [
          { userId: bob.id, role: 'ADMIN' },
          { userId: alice.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create tasks for project1
  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup authentication system',
        description: 'Implement JWT-based auth with login/register endpoints',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        position: 0,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design database schema',
        description: 'Create Prisma schema with all required models',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build task CRUD API',
        description: 'REST endpoints for creating, reading, updating, deleting tasks',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: carol.id,
        position: 0,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement drag & drop kanban',
        description: 'Allow users to drag tasks between status columns',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        position: 0,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write E2E tests',
        description: 'Cover authentication and task management flows with Playwright',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        creatorId: alice.id,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Deploy to production',
        description: 'Configure Docker and deploy to Railway',
        status: 'TODO',
        priority: 'URGENT',
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        position: 2,
      },
    }),
  ]);

  // Add a comment
  await prisma.comment.create({
    data: {
      content: 'Authentication is working! Moving this to done ✅',
      taskId: tasks1[0].id,
      authorId: alice.id,
    },
  });

  // Create tasks for project2
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Create wireframes',
        description: 'Figma wireframes for homepage and pricing page',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: bob.id,
        position: 0,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write landing page copy',
        description: 'Craft compelling copy for hero section and features',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: alice.id,
        position: 0,
      },
    }),
    prisma.task.create({
      data: {
        title: 'SEO optimization',
        description: 'Implement meta tags, sitemap and structured data',
        status: 'TODO',
        priority: 'LOW',
        projectId: project2.id,
        creatorId: bob.id,
        position: 0,
      },
    }),
  ]);

  console.log('✅ Seed complete!');
  console.log(`Created users: alice@taskflow.dev, bob@taskflow.dev, carol@taskflow.dev`);
  console.log(`Password for all users: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
