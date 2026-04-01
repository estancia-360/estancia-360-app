import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateAnimalEventDto {
    @ApiProperty({ description: 'ID del animal de estancia al que pertenece el evento', example: 10 })
    @IsInt({ message: 'El id del animal debe ser un número entero' })
    @IsPositive({ message: 'El id del animal debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del tipo de evento (1=service, 2=diagnosis, 3=birth, 4=weaning...)', example: 1 })
    @IsInt({ message: 'El id del tipo de evento debe ser un número entero' })
    @IsPositive({ message: 'El id del tipo de evento debe ser positivo' })
    idEventType: number;

    @ApiProperty({ description: 'Notas adicionales del evento', required: false, example: 'Sin observaciones' })
    @IsOptional()
    @IsString({ message: 'Las notas deben ser texto' })
    @IsNotEmpty({ message: 'Las notas no pueden estar vacías si se envían' })
    notes?: string;

    @ApiProperty({ description: 'Indica si el evento fue generado offline y sincronizado después', required: false, example: false })
    @IsOptional()
    @IsBoolean({ message: 'isSynced debe ser verdadero o falso' })
    isSynced?: boolean;

    @ApiProperty({ description: 'Fecha y hora en que ocurrió el evento (ISO 8601)', example: '2026-03-10T09:00:00.000Z' })
    @IsDateString({}, { message: 'La fecha del evento debe tener formato ISO 8601 válido' })
    eventDate: Date;
}
