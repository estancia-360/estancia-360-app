import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { DataSyncOperationDto, EventSyncOperationDto } from './base-sync-operation.dto';

export class SyncWeightRecordEngordeOperationDto extends EventSyncOperationDto {}
export class SyncFeedRecordOperationDto extends DataSyncOperationDto {}

/**
 * POST /sync/engorde — offline batch payload for the Engorde module.
 * Order: weightRecords → feedRecords. feedRecords has no animal_event — it's
 * the only record type in the whole system attached to a lot, not an animal.
 */
export class SyncEngordeDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    idRanch: number;

    @ApiPropertyOptional({ type: [SyncWeightRecordEngordeOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncWeightRecordEngordeOperationDto)
    weightRecords?: SyncWeightRecordEngordeOperationDto[];

    @ApiPropertyOptional({ type: [SyncFeedRecordOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncFeedRecordOperationDto)
    feedRecords?: SyncFeedRecordOperationDto[];
}
