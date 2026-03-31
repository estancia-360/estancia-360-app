import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";

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
        description: "IDs de los tipos de producción ganadera de la estancia",
        example: [1, 2],
        isArray: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @IsPositive({ each: true })
    idProductionTypes: number[];

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
