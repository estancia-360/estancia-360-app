import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
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

  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes' })
  @ApiOkResponse({ description: 'Lista de lotes' })
  findAll() {
    return this.ranchLotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiOkResponse({ description: 'Datos del lote' })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  findOne(@Param('id') id: string) {
    return this.ranchLotsService.findOne(+id);
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
