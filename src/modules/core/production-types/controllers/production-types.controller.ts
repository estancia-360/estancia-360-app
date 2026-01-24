import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductionTypesService } from '../services/production-types.service';
import { CreateProductionTypeDto } from '../dto/create-production-type.dto';
import { UpdateProductionTypeDto } from '../dto/update-production-type.dto';

@Controller('production-types')
export class ProductionTypesController {
  constructor(private readonly productionTypesService: ProductionTypesService) {}

  @Post()
  create(@Body() createProductionTypeDto: CreateProductionTypeDto) {
    return this.productionTypesService.create(createProductionTypeDto);
  }

  @Get()
  findAll() {
    return this.productionTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductionTypeDto: UpdateProductionTypeDto) {
    return this.productionTypesService.update(+id, updateProductionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionTypesService.remove(+id);
  }
}
