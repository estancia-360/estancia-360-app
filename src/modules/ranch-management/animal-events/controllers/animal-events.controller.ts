import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnimalEventsService } from '../services/animal-events.service';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';
import { UpdateAnimalEventDto } from '../dto/update-animal-event.dto';

@Controller('animal-events')
export class AnimalEventsController {
  constructor(private readonly animalEventsService: AnimalEventsService) {}

  @Post()
  create(@Body() createAnimalEventDto: CreateAnimalEventDto) {
    return this.animalEventsService.create(createAnimalEventDto);
  }

  @Get()
  findAll() {
    return this.animalEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animalEventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnimalEventDto: UpdateAnimalEventDto) {
    return this.animalEventsService.update(+id, updateAnimalEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalEventsService.remove(+id);
  }
}
