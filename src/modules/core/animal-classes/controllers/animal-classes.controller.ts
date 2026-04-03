import { Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { AnimalClassesService } from '../services/animal-classes.service';
import { AnimalClassDto } from '../dto/animal-class.dto';
import { OkRes } from 'src/shared/utils';
import { AuthRolesGuard } from 'src/app/auth/guards/auth-roles.guard';
import { RoleEnum } from 'src/shared/enums/role.enum';

@ApiTags('Clases de animal')
// ⚠️  TEMPORALMENTE DESACTIVADO PARA TESTING - Descomentar para reactivar seguridad
// @UseGuards(AuthRolesGuard([RoleEnum.USER]))
@Controller('animal-classes')
export class AnimalClassesController {
    constructor(private readonly animalClassesService: AnimalClassesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todas las clases de animal activas' })
    @ApiOkResponse({ type: [AnimalClassDto] })
    async findAll(@Res() res: express.Response) {
        const classes = await this.animalClassesService.findAll();
        return OkRes(res, classes);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una clase de animal por ID' })
    @ApiOkResponse({ type: AnimalClassDto })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: express.Response,
    ) {
        const animalClass = await this.animalClassesService.findOneById(id, {
            throwException: true,
            template: AnimalClassDto,
        });
        return OkRes(res, animalClass);
    }
}
