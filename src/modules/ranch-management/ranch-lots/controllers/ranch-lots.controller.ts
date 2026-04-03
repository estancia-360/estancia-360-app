import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RanchLotsService } from '../services/ranch-lots.service';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';

@ApiTags('Ranch Lots')
@Controller('ranch-lots')
export class RanchLotsController {
  constructor(private readonly ranchLotsService: RanchLotsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo lote' })
  @ApiCreatedResponse({ description: 'Lote creado exitosamente' })
  create(@Body() createRanchLotDto: CreateRanchLotDto) {
    return this.ranchLotsService.create(createRanchLotDto);
  }

  /**
   * Obtiene todos los lotes de una estancia específica
   * @param idRanch - ID de la estancia (requerido)
   * @returns Array de lotes con tipado correcto
   */
  @Get('by-ranch/:idRanch')
  @ApiOperation({ summary: 'Listar lotes de una estancia' })
  @ApiParam({ name: 'idRanch', description: 'ID de la estancia', type: 'number' })
  @ApiOkResponse({ description: 'Lista de lotes de la estancia' })
  async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number) {
    return await this.ranchLotsService.findAllByRanch(idRanch);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes' })
  @ApiOkResponse({ description: 'Lista de lotes' })
  @ApiQuery({ name: 'idRanch', description: 'ID de la estancia (opcional)', required: false })
  async findAll(@Query('idRanch') idRanch?: string) {
    if (idRanch) {
      return await this.ranchLotsService.findAllByRanch(parseInt(idRanch, 10));
    }
    return this.ranchLotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiOkResponse({ description: 'Datos del lote' })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del lote', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ranchLotsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lote' })
  @ApiOkResponse({ description: 'Lote actualizado' })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  update(@Param('id') id: string, @Body() updateRanchLotDto: UpdateRanchLotDto) {
    return this.ranchLotsService.update(+id, updateRanchLotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un lote' })
  @ApiOkResponse({ description: 'Lote eliminado' })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  remove(@Param('id') id: string) {
    return this.ranchLotsService.remove(+id);
  }
}
