import { ApiProperty } from '@nestjs/swagger';
import { BulkImportRowResultDto } from './bulk-import-row-result.dto';

export class BulkImportResultDto {
    @ApiProperty({ example: 50 })
    totalRows: number;

    @ApiProperty({ example: 47 })
    succeeded: number;

    @ApiProperty({ example: 3 })
    failed: number;

    @ApiProperty({ type: [BulkImportRowResultDto] })
    results: BulkImportRowResultDto[];
}
