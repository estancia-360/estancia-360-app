import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnimalDeclaredHistoryService } from '../services/animal-declared-history.service';
import { CreateAnimalDeclaredHistoryDto } from '../dto/create-animal-declared-history.dto';
import { UpdateAnimalDeclaredHistoryDto } from '../dto/update-animal-declared-history.dto';

@Controller('animal-declared-history')
export class AnimalDeclaredHistoryController {
  constructor(private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService) {}

  @Post()
  create(@Body() createAnimalDeclaredHistoryDto: CreateAnimalDeclaredHistoryDto) {
    return this.animalDeclaredHistoryService.create(createAnimalDeclaredHistoryDto);
  }

  @Get()
  findAll() {
    return this.animalDeclaredHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animalDeclaredHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnimalDeclaredHistoryDto: UpdateAnimalDeclaredHistoryDto) {
    return this.animalDeclaredHistoryService.update(+id, updateAnimalDeclaredHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalDeclaredHistoryService.remove(+id);
  }
}
