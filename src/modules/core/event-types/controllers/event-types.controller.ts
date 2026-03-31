import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventTypesService } from '../services/event-types.service';
import { CreateEventTypeDto } from '../dto/create-event-type.dto';
import { UpdateEventTypeDto } from '../dto/update-event-type.dto';

@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  create(@Body() createEventTypeDto: CreateEventTypeDto) {
    return this.eventTypesService.create(createEventTypeDto);
  }

  @Get()
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventTypeDto: UpdateEventTypeDto) {
    return this.eventTypesService.update(+id, updateEventTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(+id);
  }
}
