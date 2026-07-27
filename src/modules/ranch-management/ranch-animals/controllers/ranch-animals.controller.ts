import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RanchAnimalsService } from '../services/ranch-animals.service';
import { CreateRanchAnimalDto } from '../dto/create-ranch-animal.dto';
import { UpdateRanchAnimalDto } from '../dto/update-ranch-animal.dto';
import { RanchAnimalDto } from '../dto/ranch-animal.dto';
import { FindAllRanchAnimalsParamsDto } from '../dto/find-all-ranch-animals-params.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiConflict, ApiNotFound } from 'src/shared/utils/swagger';
import { PaginationResponseDto } from 'src/shared/dto';

/**
 * Error dictionary for this module:
 *   ANIMAL_NOT_FOUND          404
 *   ANIMAL_CODE_ALREADY_EXISTS 409
 *   SAME_PARENT_CODE          409
 */
@ApiTags('Ranch Animals')
@ApiBearerAuth('access-token')
@Controller('ranch-animals')
export class RanchAnimalsController {
    constructor(private readonly ranchAnimalsService: RanchAnimalsService) {}

    @Post()
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register an animal in the ranch' })
    @ApiCreatedResponse({ description: 'Animal registered successfully.' })
    @ApiConflict(
        { code: 'ANIMAL_CODE_ALREADY_EXISTS', message: 'An animal with this code already exists.' },
        { code: 'SAME_PARENT_CODE', message: 'Mother and father cannot have the same code.' },
    )
    async create(@Body() dto: CreateRanchAnimalDto): Promise<{ message: string }> {
        await this.ranchAnimalsService.create(dto, RanchAnimalDto);
        return { message: 'Animal registered successfully' };
    }

    @Put(':idAnimal')
    @UserUp()
    @ApiOperation({ summary: 'Update an animal in the ranch' })
    @ApiOkResponse({ description: 'Animal updated successfully.' })
    @ApiNotFound({ code: 'ANIMAL_NOT_FOUND', message: 'Animal not found.' })
    async update(
        @Param('idAnimal', ParseIntPipe) id: number,
        @Body() dto: UpdateRanchAnimalDto,
    ): Promise<{ message: string; animal: RanchAnimalDto }> {
        const animal = await this.ranchAnimalsService.update(id, dto, RanchAnimalDto);
        return { message: 'Animal updated successfully', animal };
    }

    @Get(':idRanch')
    @UserUp()
    @ApiOperation({ summary: 'Get all animals of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of animals.' })
    async findAll(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() params: FindAllRanchAnimalsParamsDto,
    ): Promise<PaginationResponseDto<RanchAnimalDto>> {
        return await this.ranchAnimalsService.findAll(idRanch, params, RanchAnimalDto);
    }

    @Get('one/:idAnimal')
    @UserUp()
    @ApiOperation({ summary: 'Get a single animal by ID' })
    @ApiOkResponse({ type: RanchAnimalDto })
    @ApiNotFound({ code: 'ANIMAL_NOT_FOUND', message: 'Animal not found.' })
    async findOneById(@Param('idAnimal', ParseIntPipe) idAnimal: number): Promise<RanchAnimalDto> {
        return await this.ranchAnimalsService.findOneById(RanchAnimalDto, idAnimal);
    }
}
