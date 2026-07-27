import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

export class RegisterAnimalExitDto {
    @ApiProperty({ example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ enum: ExitReasonEnum, example: ExitReasonEnum.DEATH })
    @IsEnum(ExitReasonEnum)
    reason: ExitReasonEnum;

    @ApiProperty({ description: 'Required if reason=other.', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2027-03-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
