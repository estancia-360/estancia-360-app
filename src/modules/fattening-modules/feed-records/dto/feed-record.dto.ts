import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class FeedRecordDto {
    @ApiProperty({ description: 'ID del registro de alimentación', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del lote al que se suministró el alimento', example: 3 })
    @Expose()
    @Type(() => Number)
    idLot: number;

    @ApiProperty({ description: 'ID del usuario que registró el suministro', example: 1, nullable: true })
    @Expose()
    @Type(() => Number)
    idUser?: number;

    @ApiProperty({ description: 'Fecha del suministro', example: '2027-03-15' })
    @Expose()
    feedDate: Date;

    @ApiProperty({ description: 'Tipo de alimento (texto libre: maíz, balanceado, heno, etc.)', example: 'Maíz molido' })
    @Expose()
    feedType: string;

    @ApiProperty({ description: 'Cantidad suministrada', example: 250.5, nullable: true })
    @Expose()
    @Type(() => Number)
    quantity?: number;

    @ApiProperty({ description: 'Unidad de medida (kg, bolsas, fardos). null = kg por defecto', example: 'kg', nullable: true })
    @Expose()
    unit?: string;

    @ApiProperty({ description: 'Costo total del suministro', example: 1500.00, nullable: true })
    @Expose()
    @Type(() => Number)
    cost?: number;

    @ApiProperty({ description: 'Notas adicionales', nullable: true })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Indica si fue registrado online o sincronizado desde offline', example: false })
    @Expose()
    isSynced: boolean;

    @ApiProperty({ description: 'Fecha de creación', example: '2027-03-15T10:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
