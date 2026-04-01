import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class GestationDiagnosisDto {
    @ApiProperty({ description: 'ID del diagnóstico de gestación', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 6 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'ID del servicio de monta al que pertenece este diagnóstico', example: 3 })
    @Expose()
    @Type(() => Number)
    idService: number;

    @ApiProperty({ description: 'Método de diagnóstico', enum: ['palpation', 'ultrasound'], example: 'ultrasound' })
    @Expose()
    method: string;

    @ApiProperty({ description: 'Resultado del diagnóstico', enum: ['pregnant', 'empty'], example: 'pregnant' })
    @Expose()
    result: string;

    @ApiProperty({ description: 'Días de gestación estimados al momento del diagnóstico', required: false, example: 45 })
    @Expose()
    gestationDays?: number;

    @ApiProperty({ description: 'Fecha estimada de parto', required: false, example: '2026-09-15' })
    @Expose()
    estimatedBirth?: Date;

    @ApiProperty({ description: 'Nombre del veterinario', required: false, example: 'Dr. López' })
    @Expose()
    veterinarian?: string;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();
}
