import { ApiProperty } from '@nestjs/swagger';
import { SyncCriaSectionDto } from './sync-cria-response.dto';

export class SyncSanidadResponseDto {
    @ApiProperty({ description: 'Total de operaciones procesadas con éxito', example: 3 })
    totalSucceeded: number;

    @ApiProperty({ description: 'Total de operaciones que fallaron', example: 0 })
    totalFailed: number;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de vacunaciones' })
    vaccinations: SyncCriaSectionDto;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de tratamientos' })
    treatments: SyncCriaSectionDto;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de incidentes sanitarios' })
    healthIncidents: SyncCriaSectionDto;
}
