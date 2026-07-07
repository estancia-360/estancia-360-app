import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { MovementAnimalStatusEnum } from '../entities/movement-animal.entity';

export class MovementAnimalDto {
    @ApiProperty({ description: 'ID del detalle de animal en el movimiento', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del movimiento madre', example: 1 })
    @Expose()
    @Type(() => Number)
    idMovement: number;

    @ApiProperty({ description: 'ID del animal', example: 4 })
    @Expose()
    @Type(() => Number)
    idRanchAnimal: number;

    @ApiProperty({ description: 'Lote del animal antes del movimiento (snapshot)', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    idLotOrigin?: number;

    @ApiProperty({ description: 'Lote destino (solo pasture_transfer)', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    idLotDest?: number;

    @ApiProperty({ description: 'id_status del animal antes del movimiento (para rollback, lo setea el servidor)', example: 1 })
    @Expose()
    @Type(() => Number)
    prevIdStatus: number;

    @ApiProperty({ description: 'Estado del animal dentro del movimiento', enum: MovementAnimalStatusEnum })
    @Expose()
    status: MovementAnimalStatusEnum;

    @ApiProperty({ description: 'Evento animal generado al confirmar (null mientras pending o si fue rechazado)', required: false, nullable: true })
    @Expose()
    @Type(() => Number)
    idEvent?: number;

    @ApiProperty({ description: 'Observación por animal', required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'UUID de idempotencia offline', required: false })
    @Expose()
    localId?: string;

    @ApiProperty({ description: 'Animal involucrado', type: RanchAnimalPlainDto })
    @Expose()
    @Type(() => RanchAnimalPlainDto)
    animal: RanchAnimalPlainDto = new RanchAnimalPlainDto();

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;
}
