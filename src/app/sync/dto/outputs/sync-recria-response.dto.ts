import { ApiProperty } from '@nestjs/swagger';
import { SyncCriaOperationResultDto, SyncCriaSectionDto } from './sync-cria-response.dto';

export class SyncRecriaResponseDto {
    @ApiProperty({ description: 'Total de operaciones procesadas con éxito', example: 3 })
    totalSucceeded: number;

    @ApiProperty({ description: 'Total de operaciones que fallaron', example: 0 })
    totalFailed: number;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de pesajes' })
    weightRecords: SyncCriaSectionDto;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de selecciones de recría' })
    rearingSelections: SyncCriaSectionDto;
}
