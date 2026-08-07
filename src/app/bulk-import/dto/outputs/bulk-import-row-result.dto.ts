import { ApiProperty } from '@nestjs/swagger';

export class BulkImportRowResultDto {
    @ApiProperty({ description: 'Row index as sent by the client (matches the row/group the client built from the Excel file)', example: 2 })
    rowIndex: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ required: false, description: 'ID of the created/updated record, when success=true' })
    id?: number;

    @ApiProperty({ required: false, description: 'Domain error code, when success=false (e.g. RANCH_PRODUCTION_TYPE_NOT_ENABLED, ANIMAL_CODE_ALREADY_EXISTS)' })
    errorCode?: string;

    @ApiProperty({ required: false, description: 'Human-readable error message, when success=false' })
    message?: string;
}
