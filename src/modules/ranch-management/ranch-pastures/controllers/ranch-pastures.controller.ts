import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RanchPasturesService } from '../services/ranch-pastures.service';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';

@Controller('ranch-pastures')
export class RanchPasturesController {
  constructor(private readonly ranchPasturesService: RanchPasturesService) {}

  @Post()
  create(@Body() createRanchPastureDto: CreateRanchPastureDto) {
    return this.ranchPasturesService.create(createRanchPastureDto);
  }

  @Get()
  findAll() {
    return this.ranchPasturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranchPasturesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRanchPastureDto: UpdateRanchPastureDto) {
    return this.ranchPasturesService.update(+id, updateRanchPastureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranchPasturesService.remove(+id);
  }
}
