import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, dto, req.user.id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Request() req) {
    return this.projectsService.archive(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @Request() req) {
    return this.projectsService.addMember(id, dto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.projectsService.removeMember(id, memberId, req.user.id);
  }
}
