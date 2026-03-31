import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BreedingServicesService } from '../services/breeding-services.service';
import { CreateBreedingServiceDto } from '../dto/create-breeding-service.dto';
import { UpdateBreedingServiceDto } from '../dto/update-breeding-service.dto';

@Controller('breeding-services')
export class BreedingServicesController {
  constructor(private readonly breedingServicesService: BreedingServicesService) {}

  @Post()
  create(@Body() createBreedingServiceDto: CreateBreedingServiceDto) {
    return this.breedingServicesService.create(createBreedingServiceDto);
  }

  @Get()
  findAll() {
    return this.breedingServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breedingServicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBreedingServiceDto: UpdateBreedingServiceDto) {
    return this.breedingServicesService.update(+id, updateBreedingServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.breedingServicesService.remove(+id);
  }
}
