import { ApiProperty } from '@nestjs/swagger';
import { SyncSectionDto } from './sync-common.dto';

export class SyncMovimientosResponseDto {
    @ApiProperty() totalSucceeded: number;
    @ApiProperty() totalFailed: number;
    @ApiProperty({ type: SyncSectionDto }) animalExits: SyncSectionDto;
    @ApiProperty({ type: SyncSectionDto }) movements: SyncSectionDto;
    @ApiProperty({
        type: SyncSectionDto,
        description: 'Includes the localId→serverId mapping of animals nested inside each created movement, plus the results of confirm/reject operations.',
    })
    movementAnimals: SyncSectionDto;
}
