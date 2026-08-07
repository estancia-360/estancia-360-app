import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { CreateRanchAnimalDto } from 'src/modules/ranch-management/ranch-animals/dto/create-ranch-animal.dto';

export class BulkImportAnimalRowDto extends OmitType(CreateRanchAnimalDto, ['idRanch'] as const) {
    @ApiProperty({ description: 'Row number in the source file, echoed back in the result for the client to match errors to rows', example: 2 })
    @IsInt()
    rowIndex: number;
}

export class BulkImportAnimalsDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ type: [BulkImportAnimalRowDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BulkImportAnimalRowDto)
    rows: BulkImportAnimalRowDto[];
}
