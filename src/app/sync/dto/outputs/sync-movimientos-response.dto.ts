import { ApiProperty } from '@nestjs/swagger';
import { SyncCriaSectionDto } from './sync-cria-response.dto';

export class SyncMovimientosResponseDto {
    @ApiProperty({ description: 'Total de operaciones procesadas con éxito', example: 3 })
    totalSucceeded: number;

    @ApiProperty({ description: 'Total de operaciones que fallaron', example: 0 })
    totalFailed: number;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de bajas (animal_exits)' })
    animalExits: SyncCriaSectionDto;

    @ApiProperty({ type: SyncCriaSectionDto, description: 'Resultados de movimientos (create y cancel)' })
    movements: SyncCriaSectionDto;

    @ApiProperty({
        type: SyncCriaSectionDto,
        description: 'Resultados por animal: mapeos localId→serverId de los animales anidados en creates + resultados de confirmaciones/rechazos',
    })
    movementAnimals: SyncCriaSectionDto;
}
