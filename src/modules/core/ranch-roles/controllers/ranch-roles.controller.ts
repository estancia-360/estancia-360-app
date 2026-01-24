import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RanchRolesService } from '../services/ranch-roles.service';
import { CreateRanchRoleDto } from '../dto/create-ranch-role.dto';
import { UpdateRanchRoleDto } from '../dto/update-ranch-role.dto';

@Controller('ranch-roles')
export class RanchRolesController {
  constructor(private readonly ranchRolesService: RanchRolesService) {}

  @Post()
  create(@Body() createRanchRoleDto: CreateRanchRoleDto) {
    return this.ranchRolesService.create(createRanchRoleDto);
  }

  @Get()
  findAll() {
    return this.ranchRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranchRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRanchRoleDto: UpdateRanchRoleDto) {
    return this.ranchRolesService.update(+id, updateRanchRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranchRolesService.remove(+id);
  }
}
