import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

// Único punto de entrada público — siempre agrega TRABAJADOR (RanchRolesEnum.WORKER).
// El Owner se asigna solo automáticamente al crear la estancia (RanchesService.create).
export class CreateRanchUserWorkerDto {
    @ApiProperty({ description: 'ID del usuario a asignar como trabajador', example: 8 })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idUser: number;

    @ApiProperty({ description: 'ID de la estancia', example: 3 })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idRanch: number;
}
