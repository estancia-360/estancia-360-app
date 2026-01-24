import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class CreateRanchUserWorkerDto {
    @ApiProperty({
        description: "ID del usuario que será asignado como trabajador a la estancia",
        example: 8
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idUser: number;

    @ApiProperty({
        description: "ID de la estancia ganadera a la que se asigna el trabajador",
        example: 3
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idRanch: number;
}
