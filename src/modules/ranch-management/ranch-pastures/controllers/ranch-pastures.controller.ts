import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { RanchPasturesService } from '../services/ranch-pastures.service';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';

@ApiTags('Ranch Pastures')
@Controller('ranch-pastures')
export class RanchPasturesController {
  constructor(private readonly ranchPasturesService: RanchPasturesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo potrero' })
  @ApiCreatedResponse({ description: 'Potrero creado exitosamente' })
  create(@Body() createRanchPastureDto: CreateRanchPastureDto) {
    return this.ranchPasturesService.create(createRanchPastureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los potreros' })
  @ApiOkResponse({ description: 'Lista de potreros' })
  findAll() {
    return this.ranchPasturesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un potrero por ID' })
  @ApiOkResponse({ description: 'Datos del potrero' })
  @ApiNotFoundResponse({ description: 'Potrero no encontrado' })
  findOne(@Param('id') id: string) {
    return this.ranchPasturesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un potrero' })
  @ApiOkResponse({ description: 'Potrero actualizado' })
  @ApiNotFoundResponse({ description: 'Potrero no encontrado' })
  update(@Param('id') id: string, @Body() updateRanchPastureDto: UpdateRanchPastureDto) {
    return this.ranchPasturesService.update(+id, updateRanchPastureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un potrero' })
  @ApiOkResponse({ description: 'Potrero eliminado' })
  @ApiNotFoundResponse({ description: 'Potrero no encontrado' })
  remove(@Param('id') id: string) {
    return this.ranchPasturesService.remove(+id);
  }
}
