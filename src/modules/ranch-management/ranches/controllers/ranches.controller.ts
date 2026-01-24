import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RanchesService } from '../services/ranches.service';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { UpdateRanchDto } from '../dto/update-ranch.dto';

@Controller('ranches')
export class RanchesController {
  constructor(private readonly ranchesService: RanchesService) {}

  @Post()
  create(@Body() createRanchDto: CreateRanchDto) {
    return this.ranchesService.create(createRanchDto);
  }

  @Get()
  findAll() {
    return this.ranchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranchesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRanchDto: UpdateRanchDto) {
    return this.ranchesService.update(+id, updateRanchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranchesService.remove(+id);
  }
}
