import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SyncOperationResultDto {
    @ApiProperty({ description: 'Client-generated ID sent in the operation, echoed back for local mapping.', example: 'uuid-device-abc-001' })
    @Expose()
    localId: string;

    @ApiProperty({ enum: ['success', 'failed'], example: 'success' })
    @Expose()
    status: 'success' | 'failed';

    @ApiProperty({ description: 'Server ID assigned to the record. Present on successful create/update.', required: false, example: 42 })
    @Expose()
    serverId?: number;

    @ApiProperty({ description: 'Error message. Present only when status = "failed".', required: false })
    @Expose()
    error?: string;
}

export class SyncSectionDto {
    @ApiProperty({ example: 2 })
    @Expose()
    succeeded: number;

    @ApiProperty({ example: 0 })
    @Expose()
    failed: number;

    @ApiProperty({ type: [SyncOperationResultDto] })
    @Expose()
    results: SyncOperationResultDto[];
}
