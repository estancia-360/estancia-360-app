import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SyncDownloadQueryDto {
    @ApiPropertyOptional({
        description: 'Timestamp ISO 8601 de la última sincronización. Si se omite, se descarga todo (bootstrap inicial).',
        example: '2026-06-10T12:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    since?: string;

    @ApiPropertyOptional({
        description: 'Cursor opaco (base64) devuelto en `nextCursor` de la respuesta anterior, para continuar la descarga.',
    })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiPropertyOptional({
        description: 'Cantidad máxima de registros por tabla en esta página.',
        default: 200,
        minimum: 1,
        maximum: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number;
}
