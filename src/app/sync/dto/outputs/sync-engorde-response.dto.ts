import { ApiProperty } from '@nestjs/swagger';
import { SyncCriaSectionDto } from './sync-cria-response.dto';

export class SyncEngordeResponseDto {
    @ApiProperty({ description: 'Total de operaciones procesadas con éxito', example: 3 })
    totalSucceeded: number;

    @ApiProperty({ description: 'Total de operaciones que fallaron', example: 0 })
    totalFailed: number;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de pesajes en Engorde' })
    weightRecords: SyncCriaSectionDto;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de registros de alimentación' })
    feedRecords: SyncCriaSectionDto;
}
