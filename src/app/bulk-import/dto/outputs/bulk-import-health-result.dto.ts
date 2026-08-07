import { ApiProperty } from '@nestjs/swagger';
import { BulkImportResultDto } from './bulk-import-result.dto';

export class BulkImportHealthResultDto {
    @ApiProperty({ type: BulkImportResultDto })
    vaccinations: BulkImportResultDto;

    @ApiProperty({ type: BulkImportResultDto })
    treatments: BulkImportResultDto;

    @ApiProperty({ type: BulkImportResultDto })
    healthIncidents: BulkImportResultDto;
}
