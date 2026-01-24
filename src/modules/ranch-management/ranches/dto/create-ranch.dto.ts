import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateRanchDto {
    @ApiProperty({
        description: "ID del usuario que crea o administra la estancia",
        example: 5
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idUser: number;

    @ApiProperty({
        description: "ID de la ciudad o municipio donde se encuentra la estancia",
        example: 12
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idCity: number;

    @ApiProperty({
        description: "ID del tipo de producción ganadera de la estancia",
        example: 3
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    idProductionType: number;

    @ApiProperty({
        description: "Nombre de la estancia ganadera",
        example: "Estancia San Pedro",
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;
}
