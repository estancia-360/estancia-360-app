import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
    BIRTH_TYPES,
    CRIA_STATUS,
    MOTHER_CONDITION,
} from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

/**
 * DTO para actualizar un parto.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 * No se puede cambiar el evento, el diagnóstico ni la cría vinculada.
 */
export class UpdateParturitionDto {
    @ApiProperty({
        description: 'Tipo de parto',
        enum: BIRTH_TYPES,
        required: false,
        example: 'assisted',
    })
    @IsOptional()
    @IsIn(BIRTH_TYPES, { message: `El tipo de parto debe ser uno de: ${BIRTH_TYPES.join(', ')}` })
    birthType?: typeof BIRTH_TYPES[number];

    @ApiProperty({
        description: 'Peso de la cría al nacer en kilogramos',
        required: false,
        example: 38,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    criaWeight?: number;

    @ApiProperty({
        description: 'Estado de la cría al nacer',
        enum: CRIA_STATUS,
        required: false,
        example: 'alive',
    })
    @IsOptional()
    @IsIn(CRIA_STATUS, { message: `El estado de la cría debe ser uno de: ${CRIA_STATUS.join(', ')}` })
    criaStatus?: typeof CRIA_STATUS[number];

    @ApiProperty({
        description: 'Condición de la madre tras el parto',
        enum: MOTHER_CONDITION,
        required: false,
        example: 'good',
    })
    @IsOptional()
    @IsIn(MOTHER_CONDITION, { message: `La condición de la madre debe ser uno de: ${MOTHER_CONDITION.join(', ')}` })
    motherCondition?: typeof MOTHER_CONDITION[number];
}
