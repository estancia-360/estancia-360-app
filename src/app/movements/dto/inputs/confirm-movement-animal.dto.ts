import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ConfirmMovementAnimalDto {
    @ApiProperty({
        description: 'Decisión sobre el animal: accepted (vendido definitivo) o rejected (revierte al estado previo)',
        enum: ['accepted', 'rejected'],
        example: 'accepted',
    })
    @IsIn(['accepted', 'rejected'], { message: 'La decisión debe ser accepted o rejected' })
    status: 'accepted' | 'rejected';

    @ApiProperty({ description: 'Observación (ej. motivo de rechazo del comprador)', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Indica si la confirmación fue registrada offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
