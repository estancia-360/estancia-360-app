import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeightTypeEnum } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';
import { RearingDestinationEnum } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';
import { SYNC_OPERATION_TYPES, SyncOperationType, BaseSyncOperationDto } from './sync-cria.dto';

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de pesaje (weight_records)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncWeightRecordOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del pesaje.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), idLot (o localRef_idLot), weight, weightType.
**Campos update:** weight, weightType, bodyCondition, ageDays, notes.
**Campos delete:** vacío.`,
        example: {
            idRanchAnimal: 5,
            idLot: 3,
            weight: 185.5,
            weightType: 'scale',
            bodyCondition: 3,
            ageDays: 180,
        },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({
        description: 'Fecha y hora en que ocurrió el pesaje (ISO 8601)',
        example: '2026-05-10T08:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de selección de recría (rearing_selections)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRearingSelectionOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos de la selección de recría.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), destination, idLotDest (si fattening), systemType (si fattening), weightAtSelection, bodyCondition, geneticScore.
**Campos update:** weightAtSelection, bodyCondition, geneticScore.
**Campos delete:** vacío.`,
        example: {
            idRanchAnimal: 5,
            destination: 'replacement',
            weightAtSelection: 200.0,
            bodyCondition: 4,
            geneticScore: 7.5,
        },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({
        description: 'Fecha y hora de la selección (ISO 8601)',
        example: '2026-06-15T10:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DTO raíz del batch de RECRÍA
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRecriaDto {
    @ApiProperty({
        description: 'ID de la estancia a la que pertenecen todos los registros del batch',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncWeightRecordOperationDto],
        description: 'Pesajes a sincronizar (weight_records). Se procesan en orden — primero pesajes antes que selecciones.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncWeightRecordOperationDto)
    weightRecords?: SyncWeightRecordOperationDto[];

    @ApiPropertyOptional({
        type: [SyncRearingSelectionOperationDto],
        description: 'Selecciones de recría a sincronizar. Se procesan después de los pesajes.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRearingSelectionOperationDto)
    rearingSelections?: SyncRearingSelectionOperationDto[];
}
