import { IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class FindAllParamsDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number = 10;

    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = 1;
}