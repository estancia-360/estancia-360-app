import { ApiProperty } from '@nestjs/swagger';
import { SyncSectionDto } from './sync-common.dto';

export class SyncEngordeResponseDto {
    @ApiProperty() totalSucceeded: number;
    @ApiProperty() totalFailed: number;
    @ApiProperty({ type: SyncSectionDto }) fatteningEntries: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) weightRecords: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) feedRecords: SyncSectionDto;
}
