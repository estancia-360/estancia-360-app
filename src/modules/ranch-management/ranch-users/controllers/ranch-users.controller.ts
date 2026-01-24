import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RanchUsersService } from '../services/ranch-users.service';
import { CreateRanchUserDto } from '../dto/create-ranch-user.dto';
import { UpdateRanchUserDto } from '../dto/update-ranch-user.dto';

@Controller('ranch-users')
export class RanchUsersController {
  constructor(private readonly ranchUsersService: RanchUsersService) {}

  @Post()
  create(@Body() createRanchUserDto: CreateRanchUserDto) {
    return this.ranchUsersService.create(createRanchUserDto);
  }

  @Get()
  findAll() {
    return this.ranchUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranchUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRanchUserDto: UpdateRanchUserDto) {
    return this.ranchUsersService.update(+id, updateRanchUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranchUsersService.remove(+id);
  }
}
