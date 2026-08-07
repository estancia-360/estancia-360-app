import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { RegisterMovementDto } from 'src/app/movements/dto/inputs/register-movement.dto';
import { RegisterAnimalExitDto } from 'src/app/movements/dto/inputs/register-animal-exit.dto';

// One entry per ID_CARGA group in the source sheet (Carga_Compras/Carga_Ventas/Carga_Traslados/
// Carga_Salidas_Estancia) — movementType tells the use-case which of the 4 sheets it came from,
// same shape POST /movements/register already accepts (animals[] nested, one POST per group).
export class BulkImportMovementGroupDto extends OmitType(RegisterMovementDto, ['idRanch'] as const) {
    @ApiProperty({ description: 'ID_CARGA group index in the source file, echoed back in the result', example: 1 })
    @IsInt()
    rowIndex: number;
}

// Carga_Bajas — one row = one exit, not grouped.
export class BulkImportExitRowDto extends RegisterAnimalExitDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportMovementsDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ type: [BulkImportMovementGroupDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportMovementGroupDto)
    groups?: BulkImportMovementGroupDto[];

    @ApiProperty({ type: [BulkImportExitRowDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportExitRowDto)
    exits?: BulkImportExitRowDto[];
}
