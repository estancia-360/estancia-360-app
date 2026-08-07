import { ApiProperty } from '@nestjs/swagger';
import { BulkImportResultDto } from './bulk-import-result.dto';

export class BulkImportMovementsResultDto {
    @ApiProperty({ type: BulkImportResultDto, description: 'One result per ID_CARGA group (Carga_Compras/Carga_Ventas/Carga_Traslados/Carga_Salidas_Estancia)' })
    movements: BulkImportResultDto;

    @ApiProperty({ type: BulkImportResultDto, description: 'One result per row (Carga_Bajas)' })
    exits: BulkImportResultDto;
}
