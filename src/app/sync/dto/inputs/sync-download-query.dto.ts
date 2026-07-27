import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SyncDownloadQueryDto {
    @ApiPropertyOptional({ description: 'ISO 8601 timestamp of the last sync. Omit for a full bootstrap download.', example: '2026-06-10T12:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    since?: string;

    @ApiPropertyOptional({ description: 'Opaque cursor (base64) returned as `nextCursor` in the previous response, to continue paginating.' })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiPropertyOptional({ description: 'Max records per table in this page.', default: 200, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number;
}
