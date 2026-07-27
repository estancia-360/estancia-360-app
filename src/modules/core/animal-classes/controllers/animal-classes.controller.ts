import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AnimalClassesService } from '../services/animal-classes.service';
import { AnimalClassDto } from '../dto/animal-class.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   ANIMAL_CLASS_NOT_FOUND   404
 */
@ApiTags('Animal Classes')
@ApiBearerAuth('access-token')
@Controller('animal-classes')
export class AnimalClassesController {
    constructor(private readonly animalClassesService: AnimalClassesService) {}

    @Get()
    @UserUp()
    @ApiOperation({ summary: 'Get all active animal classes' })
    @ApiOkResponse({ type: [AnimalClassDto] })
    async findAll(): Promise<AnimalClassDto[]> {
        return await this.animalClassesService.findAllActive();
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get an animal class by ID' })
    @ApiOkResponse({ type: AnimalClassDto })
    @ApiNotFound({ code: 'ANIMAL_CLASS_NOT_FOUND', message: 'Animal class not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<AnimalClassDto> {
        return await this.animalClassesService.findOneById(AnimalClassDto, id);
    }
}
