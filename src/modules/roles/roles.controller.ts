import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List semua role' })
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List semua permission' })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail role' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneRole(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah role' })
  create(@Body() data: any) {
    return this.rolesService.createRole(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit role' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Nonaktifkan role' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Permission role' })
  getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Set permission role' })
  setPermissions(@Param('id', ParseIntPipe) id: number, @Body() body: { permissions: string[] }) {
    return this.rolesService.setRolePermissions(id, body.permissions);
  }
}