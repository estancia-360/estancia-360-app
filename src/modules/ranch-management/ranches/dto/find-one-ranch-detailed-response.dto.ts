import { ApiProperty } from '@nestjs/swagger';
import { RanchDetailedDto } from './ranch-detailed.dto';

/**
 * Response DTO para GET /ranches/{idRanch}
 * Envuelve RanchDetailedDto con información completa de la estancia
 */
export class FindOneRanchDetailedResponseDto {
    @ApiProperty({
        description: 'Información detallada de la estancia',
        type: RanchDetailedDto,
    })
    ranch: RanchDetailedDto;
}
