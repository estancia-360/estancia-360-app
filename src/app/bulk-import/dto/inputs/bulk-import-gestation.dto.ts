import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { RegisterGestationDiagnosisDto } from 'src/app/breeding/dto/inputs/register-gestation-diagnosis.dto';

// idService is never sent by the client here — the use-case resolves it to the animal's
// most recent breeding service, same rule the mobile bulk importer uses (RN-12/RN-14 context).
export class BulkImportGestationRowDto extends OmitType(RegisterGestationDiagnosisDto, ['idService'] as const) {
    @ApiProperty({ description: 'Row number in the source file, echoed back in the result for the client to match errors to rows', example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportGestationDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ type: [BulkImportGestationRowDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BulkImportGestationRowDto)
    rows: BulkImportGestationRowDto[];
}
