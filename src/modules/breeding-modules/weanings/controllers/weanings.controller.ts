import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeaningsService } from '../services/weanings.service';
import { CreateWeaningDto } from '../dto/create-weaning.dto';
import { UpdateWeaningDto } from '../dto/update-weaning.dto';

@Controller('weanings')
export class WeaningsController {
  constructor(private readonly weaningsService: WeaningsService) {}

  @Post()
  create(@Body() createWeaningDto: CreateWeaningDto) {
    return this.weaningsService.create(createWeaningDto);
  }

  @Get()
  findAll() {
    return this.weaningsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weaningsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeaningDto: UpdateWeaningDto) {
    return this.weaningsService.update(+id, updateWeaningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weaningsService.remove(+id);
  }
}
