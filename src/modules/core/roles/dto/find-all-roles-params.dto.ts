import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto';

export class FindAllRolesParamsDto extends PaginationParamsDto {
    @ApiPropertyOptional({ example: 'admin', description: 'Filtrar por nombre' })
    @IsOptional()
    @IsString()
    search?: string;
}
