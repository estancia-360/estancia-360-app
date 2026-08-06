import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { IncidentTypeEnum } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';

export class RegisterHealthIncidentDto {
    @ApiProperty({ example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({
        description: '"quarantine" automatically sets the animal to id_status=2 (En Observación).',
        enum: IncidentTypeEnum,
        example: IncidentTypeEnum.QUARANTINE,
    })
    @IsEnum(IncidentTypeEnum)
    incidentType: IncidentTypeEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2027-02-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
