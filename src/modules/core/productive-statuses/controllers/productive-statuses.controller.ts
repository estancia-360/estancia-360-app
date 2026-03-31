import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductiveStatusesService } from '../services/productive-statuses.service';
import { CreateProductiveStatusDto } from '../dto/create-productive-status.dto';
import { UpdateProductiveStatusDto } from '../dto/update-productive-status.dto';

@Controller('productive-statuses')
export class ProductiveStatusesController {
  constructor(private readonly productiveStatusesService: ProductiveStatusesService) {}

  @Post()
  create(@Body() createProductiveStatusDto: CreateProductiveStatusDto) {
    return this.productiveStatusesService.create(createProductiveStatusDto);
  }

  @Get()
  findAll() {
    return this.productiveStatusesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productiveStatusesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductiveStatusDto: UpdateProductiveStatusDto) {
    return this.productiveStatusesService.update(+id, updateProductiveStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productiveStatusesService.remove(+id);
  }
}
