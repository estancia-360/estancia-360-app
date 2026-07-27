import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParturitionsService } from '../services/parturitions.service';
import { ParturitionDto } from '../dto/parturition.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Parturitions')
@ApiBearerAuth('access-token')
@Controller('parturitions')
export class ParturitionsController {
    constructor(private readonly parturitionsService: ParturitionsService) {}

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List parturitions of a ranch, paginated' })
    @ApiOkResponse({ description: 'Paginated list of parturitions.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<ParturitionDto>> {
        return await this.parturitionsService.findAllByRanch(idRanch, pagination);
    }

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List parturitions of an animal (as mother), paginated' })
    @ApiOkResponse({ description: 'Paginated list of parturitions.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<ParturitionDto>> {
        return await this.parturitionsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':idParturition')
    @UserUp()
    @ApiOperation({ summary: 'Get a parturition by ID' })
    @ApiOkResponse({ type: ParturitionDto })
    @ApiNotFound({ code: 'PARTURITION_NOT_FOUND', message: 'Parturition not found.' })
    async findOneById(@Param('idParturition', ParseIntPipe) idParturition: number): Promise<ParturitionDto> {
        return await this.parturitionsService.findOneById(ParturitionDto, idParturition);
    }
}
