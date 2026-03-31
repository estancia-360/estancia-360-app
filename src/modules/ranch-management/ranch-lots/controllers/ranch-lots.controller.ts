import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RanchLotsService } from '../services/ranch-lots.service';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';

@Controller('ranch-lots')
export class RanchLotsController {
  constructor(private readonly ranchLotsService: RanchLotsService) {}

  @Post()
  create(@Body() createRanchLotDto: CreateRanchLotDto) {
    return this.ranchLotsService.create(createRanchLotDto);
  }

  @Get()
  findAll() {
    return this.ranchLotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranchLotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRanchLotDto: UpdateRanchLotDto) {
    return this.ranchLotsService.update(+id, updateRanchLotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranchLotsService.remove(+id);
  }
}
