import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ConfirmMovementAnimalDto {
    @ApiProperty({
        description: 'Decision on the animal: accepted (final sale) or rejected (reverts to previous status)',
        enum: ['accepted', 'rejected'],
        example: 'accepted',
    })
    @IsIn(['accepted', 'rejected'])
    status: 'accepted' | 'rejected';

    @ApiProperty({ description: 'Note (e.g. buyer rejection reason)', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
