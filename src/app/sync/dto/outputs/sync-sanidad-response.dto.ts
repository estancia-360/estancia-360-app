import { ApiProperty } from '@nestjs/swagger';
import { SyncSectionDto } from './sync-common.dto';

export class SyncSanidadResponseDto {
    @ApiProperty() totalSucceeded: number;
    @ApiProperty() totalFailed: number;
    @ApiProperty({ type: SyncSectionDto }) vaccinations: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) treatments: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) healthIncidents: SyncSectionDto;
}
