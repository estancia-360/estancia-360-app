import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductionTypesService } from '../services/production-types.service';
import { CreateProductionTypeDto } from '../dto/create-production-type.dto';
import { UpdateProductionTypeDto } from '../dto/update-production-type.dto';

@Controller('production-types')
export class ProductionTypesController {

}
