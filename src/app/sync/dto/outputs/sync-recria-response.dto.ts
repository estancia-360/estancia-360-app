import { ApiProperty } from '@nestjs/swagger';
import { SyncSectionDto } from './sync-common.dto';

export class SyncRecriaResponseDto {
    @ApiProperty() totalSucceeded: number;
    @ApiProperty() totalFailed: number;
    @ApiProperty({ type: SyncSectionDto }) weightRecords: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) rearingSelections: SyncSectionDto;
}
