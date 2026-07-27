import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { EventSyncOperationDto } from './base-sync-operation.dto';

export class SyncWeightRecordOperationDto extends EventSyncOperationDto {}
export class SyncRearingSelectionOperationDto extends EventSyncOperationDto {}

/**
 * POST /sync/recria — offline batch payload for the Recría module.
 * Order: weightRecords → rearingSelections.
 */
export class SyncRecriaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    idRanch: number;

    @ApiPropertyOptional({ type: [SyncWeightRecordOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncWeightRecordOperationDto)
    weightRecords?: SyncWeightRecordOperationDto[];

    @ApiPropertyOptional({ type: [SyncRearingSelectionOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncRearingSelectionOperationDto)
    rearingSelections?: SyncRearingSelectionOperationDto[];
}
