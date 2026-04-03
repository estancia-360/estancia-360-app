import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CityDto } from 'src/modules/core/cities/dto/city.dto';
import { ProductionTypeDto } from 'src/modules/core/production-types/dto/production-type.dto';
import { RanchUserDto } from './ranch-user.dto';

/**
 * DTO extendido para obtener información completa de una estancia.
 * Incluye:
 * - Datos básicos de la estancia
 * - Ciudad y ubicación
 * - Tipos de producción (obtenidos directamente vía relación ManyToMany)
 * - Usuarios asignados con sus roles
 *
 * Los tipos de producción se cargan directamente desde la relación ManyToMany
 * en la entidad Ranch sin necesidad de transformaciones.
 */
export class RanchDetailedDto {
    @ApiProperty({
        description: 'Identificador único de la estancia ganadera',
        example: 1,
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'Nombre de la estancia ganadera',
        example: 'Estancia San Pedro',
    })
    @Expose()
    name: string;

    @ApiProperty({
        description: 'Ciudad o municipio donde se ubica la estancia',
        type: CityDto,
    })
    @Expose()
    @Type(() => CityDto)
    city: CityDto = new CityDto();

    @ApiProperty({
        description:
            'Tipos de producción de la estancia ganadera (relación directa)',
        type: [ProductionTypeDto],
    })
    @Expose()
    @Type(() => ProductionTypeDto)
    productionTypesDirectly: ProductionTypeDto[] = [new ProductionTypeDto()];

    @ApiProperty({
        description: 'Usuarios asignados a esta estancia con sus roles específicos',
        type: [RanchUserDto],
    })
    @Expose()
    @Type(() => RanchUserDto)
    ranchUsers: RanchUserDto[] = [new RanchUserDto()];

    @ApiProperty({
        description: 'Fecha de creación del registro de la estancia',
        example: '2026-01-20T14:30:00.000Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de la última actualización del registro',
        example: '2026-01-22T10:15:00.000Z',
    })
    @Expose()
    updatedAt: Date;
}
