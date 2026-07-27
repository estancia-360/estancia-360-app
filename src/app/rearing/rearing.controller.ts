import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { RegisterWeightRecordUseCase } from './use-cases/register-weight-record.use-case';
import { UpdateWeightRecordUseCase } from './use-cases/update-weight-record.use-case';
import { DeleteWeightRecordUseCase } from './use-cases/delete-weight-record.use-case';
import { RegisterRearingSelectionUseCase } from './use-cases/register-rearing-selection.use-case';
import { UpdateRearingSelectionUseCase } from './use-cases/update-rearing-selection.use-case';
import { DeleteRearingSelectionUseCase } from './use-cases/delete-rearing-selection.use-case';

import { RegisterWeightRecordDto } from './dto/inputs/register-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/inputs/update-weight-record.dto';
import { RegisterRearingSelectionDto } from './dto/inputs/register-rearing-selection.dto';
import { UpdateRearingSelectionDto } from './dto/inputs/update-rearing-selection.dto';

import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RearingSelectionDto } from 'src/modules/rearing-modules/rearing-selections/dto/rearing-selection.dto';

@ApiTags('Rearing — Recría')
@ApiBearerAuth('access-token')
@Controller('rearing')
export class RearingController {
    constructor(
        private readonly registerWeightRecordUseCase: RegisterWeightRecordUseCase,
        private readonly updateWeightRecordUseCase: UpdateWeightRecordUseCase,
        private readonly deleteWeightRecordUseCase: DeleteWeightRecordUseCase,
        private readonly registerRearingSelectionUseCase: RegisterRearingSelectionUseCase,
        private readonly updateRearingSelectionUseCase: UpdateRearingSelectionUseCase,
        private readonly deleteRearingSelectionUseCase: DeleteRearingSelectionUseCase,
    ) {}

    // ── Weight records ──────────────────────────────────────────

    @Post('weight-record')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a weighing',
        description: 'Stores the new weight in ranch_animals.weight. ADG is not stored — compute it client-side from GET /weight-records/animal/:id (chronological order).',
    })
    async registerWeightRecord(
        @Body() dto: RegisterWeightRecordDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ weightRecord: WeightRecordDto }> {
        return { weightRecord: await this.registerWeightRecordUseCase.execute(dto, idUser) };
    }

    @Patch('weight-record/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a weighing' })
    async updateWeightRecord(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWeightRecordDto,
    ): Promise<{ weightRecord: WeightRecordDto }> {
        return { weightRecord: await this.updateWeightRecordUseCase.execute(id, dto) };
    }

    @Delete('weight-record/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a weighing' })
    async deleteWeightRecord(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteWeightRecordUseCase.execute(id);
    }

    // ── Rearing selection ───────────────────────────────────────

    @Post('rearing-selection')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Register an animal's rearing-stage destination decision (replacement / fattening / sale)" })
    async registerRearingSelection(
        @Body() dto: RegisterRearingSelectionDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ rearingSelection: RearingSelectionDto }> {
        return { rearingSelection: await this.registerRearingSelectionUseCase.execute(dto, idUser) };
    }

    @Patch('rearing-selection/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a rearing selection (destination cannot be changed post-registration)' })
    async updateRearingSelection(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRearingSelectionDto,
    ): Promise<{ rearingSelection: RearingSelectionDto }> {
        return { rearingSelection: await this.updateRearingSelectionUseCase.execute(id, dto) };
    }

    @Delete('rearing-selection/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a rearing selection and revert the animal state if applicable' })
    async deleteRearingSelection(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteRearingSelectionUseCase.execute(id);
    }
}
