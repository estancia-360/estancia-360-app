import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { RegisterVaccinationDto } from 'src/app/animal-health/dto/inputs/register-vaccination.dto';
import { RegisterTreatmentDto } from 'src/app/animal-health/dto/inputs/register-treatment.dto';
import { RegisterHealthIncidentDto } from 'src/app/animal-health/dto/inputs/register-health-incident.dto';

export class BulkImportVaccinationRowDto extends RegisterVaccinationDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportTreatmentRowDto extends RegisterTreatmentDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportHealthIncidentRowDto extends RegisterHealthIncidentDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    rowIndex: number;

    @ApiProperty({
        required: false,
        description:
            'Only used when the row already carries a resolution date at import time (template column FECHA_RESUELTO). ' +
            'Not part of the online single-record endpoint — the use-case registers the incident and immediately applies ' +
            'this as a follow-up update, same effect as resolving it manually right after.',
    })
    @IsOptional()
    @IsDateString()
    resolvedAt?: Date;
}

export class BulkImportHealthDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ type: [BulkImportVaccinationRowDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportVaccinationRowDto)
    vaccinations?: BulkImportVaccinationRowDto[];

    @ApiProperty({ type: [BulkImportTreatmentRowDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportTreatmentRowDto)
    treatments?: BulkImportTreatmentRowDto[];

    @ApiProperty({ type: [BulkImportHealthIncidentRowDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportHealthIncidentRowDto)
    healthIncidents?: BulkImportHealthIncidentRowDto[];
}
