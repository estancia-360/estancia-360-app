import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export const SYNC_OPERATION_TYPES = ['create', 'update', 'delete'] as const;
export type SyncOperationType = (typeof SYNC_OPERATION_TYPES)[number];

/**
 * Generic offline sync operation. `data` fields prefixed `localRef_<field>` are
 * resolved by the server against other records created earlier in the SAME batch
 * (any module) — replaced by the real serverId before validation.
 */
export class BaseSyncOperationDto {
    @ApiProperty({ description: 'Unique client-generated ID for this record within the batch.', example: 'uuid-device-abc-001' })
    @IsString()
    @IsNotEmpty()
    localId: string;

    @ApiProperty({ enum: SYNC_OPERATION_TYPES, example: 'create' })
    @IsIn(SYNC_OPERATION_TYPES)
    operation: SyncOperationType;

    @ApiPropertyOptional({ description: 'Server ID of the record to update/delete. Required for update/delete, ignored on create.', example: 42 })
    @IsOptional()
    @IsInt()
    serverId?: number;
}

export class DataSyncOperationDto extends BaseSyncOperationDto {
    @ApiProperty({ type: 'object', additionalProperties: true, description: 'Record fields for this operation. See the module guide for the exact field set per entity.' })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

export class EventSyncOperationDto extends DataSyncOperationDto {
    @ApiProperty({ description: 'When this event happened on the device (ISO 8601). Stored as eventDate.', example: '2026-03-10T09:30:00.000Z' })
    @IsDateString()
    happenedAt: string;
}
