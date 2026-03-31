import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GestationDiagnosesService } from '../services/gestation-diagnoses.service';
import { CreateGestationDiagnosisDto } from '../dto/create-gestation-diagnosis.dto';
import { UpdateGestationDiagnosisDto } from '../dto/update-gestation-diagnosis.dto';

@Controller('gestation-diagnoses')
export class GestationDiagnosesController {
  constructor(private readonly gestationDiagnosesService: GestationDiagnosesService) {}

  @Post()
  create(@Body() createGestationDiagnosisDto: CreateGestationDiagnosisDto) {
    return this.gestationDiagnosesService.create(createGestationDiagnosisDto);
  }

  @Get()
  findAll() {
    return this.gestationDiagnosesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gestationDiagnosesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGestationDiagnosisDto: UpdateGestationDiagnosisDto) {
    return this.gestationDiagnosesService.update(+id, updateGestationDiagnosisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gestationDiagnosesService.remove(+id);
  }
}
