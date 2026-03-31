import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParturitionsService } from '../services/parturitions.service';
import { CreateParturitionDto } from '../dto/create-parturition.dto';
import { UpdateParturitionDto } from '../dto/update-parturition.dto';

@Controller('parturitions')
export class ParturitionsController {
  constructor(private readonly parturitionsService: ParturitionsService) {}

  @Post()
  create(@Body() createParturitionDto: CreateParturitionDto) {
    return this.parturitionsService.create(createParturitionDto);
  }

  @Get()
  findAll() {
    return this.parturitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parturitionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParturitionDto: UpdateParturitionDto) {
    return this.parturitionsService.update(+id, updateParturitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parturitionsService.remove(+id);
  }
}
