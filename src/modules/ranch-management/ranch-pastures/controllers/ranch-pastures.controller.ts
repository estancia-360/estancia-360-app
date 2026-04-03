import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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

  /**
   * Obtiene todos los potreros de una estancia específica
   * @param idRanch - ID de la estancia (requerido)
   * @returns Array de potreros con tipado correcto
   */
  @Get('by-ranch/:idRanch')
  @ApiOperation({ summary: 'Listar potreros de una estancia' })
  @ApiParam({ name: 'idRanch', description: 'ID de la estancia', type: 'number' })
  @ApiOkResponse({ description: 'Lista de potreros de la estancia' })
  async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number) {
    return await this.ranchPasturesService.findAllByRanch(idRanch);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los potreros' })
  @ApiOkResponse({ description: 'Lista de potreros' })
  @ApiQuery({ name: 'idRanch', description: 'ID de la estancia (opcional)', required: false })
  async findAll(@Query('idRanch') idRanch?: string) {
    if (idRanch) {
      return await this.ranchPasturesService.findAllByRanch(parseInt(idRanch, 10));
    }
    return this.ranchPasturesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un potrero por ID' })
  @ApiOkResponse({ description: 'Datos del potrero' })
  @ApiNotFoundResponse({ description: 'Potrero no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del potrero', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ranchPasturesService.findOne(id);
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
