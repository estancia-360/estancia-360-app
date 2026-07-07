import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MovementAnimalDto } from 'src/modules/movement-modules/movement-animals/dto/movement-animal.dto';
import { MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';

export class MovementDto {
    @ApiProperty({ description: 'ID del movimiento', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @Expose()
    @Type(() => Number)
    idRanch: number;

    @ApiProperty({ description: 'ID del usuario que registró el movimiento', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    idUser?: number;

    @ApiProperty({ description: 'Tipo de movimiento', enum: MovementTypeEnum })
    @Expose()
    movementType: MovementTypeEnum;

    @ApiProperty({ description: 'Fecha efectiva de la operación', example: '2027-03-01' })
    @Expose()
    movementDate: Date;

    @ApiProperty({ description: 'Estado global del movimiento', enum: MovementStatusEnum })
    @Expose()
    status: MovementStatusEnum;

    @ApiProperty({ description: 'sale: comprador | ranch_exit: estancia destino', required: false })
    @Expose()
    counterpartName?: string;

    @ApiProperty({ description: 'purchase: proveedor o estancia de origen', required: false })
    @Expose()
    originName?: string;

    @ApiProperty({ description: 'Precio total (sale/purchase)', required: false })
    @Expose()
    @Type(() => Number)
    totalPrice?: number;

    @ApiProperty({ description: 'Precio por kg (sale/purchase)', required: false })
    @Expose()
    @Type(() => Number)
    pricePerKg?: number;

    @ApiProperty({ description: 'Observaciones', required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'UUID de idempotencia offline', required: false })
    @Expose()
    localId?: string;

    @ApiProperty({ description: 'Detalle por animal', type: [MovementAnimalDto] })
    @Expose()
    @Type(() => MovementAnimalDto)
    animals: MovementAnimalDto[] = [];

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;
}
