import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { RegisterWeightRecordDto } from 'src/app/rearing/dto/inputs/register-weight-record.dto';

export class BulkImportWeightRowDto extends RegisterWeightRecordDto {
    @ApiProperty({ description: 'Row number in the source file, echoed back in the result for the client to match errors to rows', example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportWeightsDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ type: [BulkImportWeightRowDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BulkImportWeightRowDto)
    rows: BulkImportWeightRowDto[];
}
