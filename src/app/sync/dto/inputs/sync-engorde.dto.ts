import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsObject, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseSyncOperationDto } from './sync-cria.dto';

export class SyncWeightRecordEngordeOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del pesaje en Engorde.
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), idLot, weight, weightType.
**Campos update:** weight, weightType, bodyCondition, ageDays, notes.
**Campos delete:** vacío.`,
        example: { idRanchAnimal: 7, idLot: 3, weight: 280.5, weightType: 'scale' },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora del pesaje (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncFeedRecordOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del registro de alimentación.
**Campos create:** idLot (o localRef_idLot), feedDate, feedType, quantity, unit, cost, notes.
**Campos update:** feedType, quantity, unit, cost, notes.
**Campos delete:** vacío.`,
        example: { idLot: 3, feedDate: '2027-05-10', feedType: 'Maíz molido', quantity: 250, unit: 'kg', cost: 1500 },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora del registro (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncEngordeDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncWeightRecordEngordeOperationDto],
        description: 'Pesajes de animales en Engorde (ps=3). Se procesan primero.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncWeightRecordEngordeOperationDto)
    weightRecords?: SyncWeightRecordEngordeOperationDto[];

    @ApiPropertyOptional({
        type: [SyncFeedRecordOperationDto],
        description: 'Registros de alimentación por lote. Se procesan después de los pesajes.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncFeedRecordOperationDto)
    feedRecords?: SyncFeedRecordOperationDto[];
}
