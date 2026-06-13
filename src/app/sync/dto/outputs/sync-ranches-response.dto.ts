import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SyncRanchDto {
    @ApiProperty() @Expose() @Type(() => Number) idRanch: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() @Type(() => Number) idRanchRole: number;
    @ApiProperty() @Expose() ranchRoleName: string;
}
